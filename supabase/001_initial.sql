-- Apply once with the Supabase SQL editor. All decisions use server-owned roles.
create extension if not exists pgcrypto;
create table public.profiles(id uuid primary key references auth.users on delete cascade, role text not null default 'customer' check(role in ('customer','provider','admin')),display_name text,created_at timestamptz not null default now());
create table public.providers(id uuid primary key default gen_random_uuid(),owner_id uuid not null unique references public.profiles, name text not null,description text not null default '',city text not null,services text[] not null default '{}',capacity int check(capacity>0),images text[] not null default '{}',approved boolean not null default false,created_at timestamptz not null default now());
create table public.memberships(id uuid primary key default gen_random_uuid(),provider_id uuid not null unique references public.providers,expires_at timestamptz not null,updated_at timestamptz not null default now());
create table public.settings(id boolean primary key default true check(id),annual_fee bigint not null check(annual_fee>0));
insert into public.settings values(true,3000000);
create table public.payments(id uuid primary key default gen_random_uuid(),provider_id uuid not null references public.providers,amount bigint not null check(amount>0),bank_reference text not null unique,status text not null default 'pending' check(status in ('pending','confirmed','rejected')),confirmed_by uuid references public.profiles,confirmed_at timestamptz,created_at timestamptz not null default now());
create table public.event_requests(id uuid primary key default gen_random_uuid(),owner_id uuid not null references public.profiles,title text not null check(length(title) between 10 and 140),type text not null,city text not null,date date not null,deadline date not null check(deadline<=date),guests int not null check(guests between 5 and 100000),budget bigint not null check(budget>=1000000),description text not null check(length(description) between 20 and 3000),consent_public boolean not null default false,status text not null default 'pending' check(status in ('pending','open','closed','rejected')),created_at timestamptz not null default now());
create table public.proposals(id uuid primary key default gen_random_uuid(),request_id uuid not null references public.event_requests,provider_id uuid not null references public.providers,price bigint not null check(price>0),message text not null check(length(message) between 30 and 5000),selected boolean not null default false,created_at timestamptz not null default now(),unique(request_id,provider_id));
create table public.replies(id uuid primary key default gen_random_uuid(),proposal_id uuid not null references public.proposals,author_id uuid not null references public.profiles,message text not null check(length(message) between 1 and 3000),created_at timestamptz not null default now());
create table public.notifications(id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles,request_id uuid not null references public.event_requests,message text not null,read_at timestamptz,created_at timestamptz not null default now());
create table public.email_queue(id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles,request_id uuid not null references public.event_requests,dedupe_key text not null unique,attempts int not null default 0,next_attempt_at timestamptz not null default now(),sent_at timestamptz,locked_until timestamptz,claim_token uuid,last_error text,created_at timestamptz not null default now());
create table public.facebook_groups(id uuid primary key default gen_random_uuid(),url text not null unique,active boolean not null default true,created_at timestamptz not null default now());
insert into public.facebook_groups(url,active) values('https://www.facebook.com/groups/3293497610791180',false);
create table public.facebook_imports(id uuid primary key default gen_random_uuid(),external_id text not null unique,source_url text not null unique,group_id uuid references public.facebook_groups,raw_text text not null,posted_at timestamptz,classification text not null,status text not null default 'pending' check(status in ('pending','rejected','invited','consented')),consent_record text,created_at timestamptz not null default now());
create table public.sync_runs(id uuid primary key default gen_random_uuid(),group_id uuid references public.facebook_groups,status text not null,details text,created_at timestamptz not null default now());
create table public.audit_log(id uuid primary key default gen_random_uuid(),actor_id uuid references public.profiles,action text not null,record_id uuid,created_at timestamptz not null default now());
create function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$select exists(select 1 from profiles where id=auth.uid() and role='admin')$$;
create function public.new_profile() returns trigger language plpgsql security definer set search_path=public as $$begin insert into profiles(id) values(new.id);return new;end$$;
create trigger on_user_created after insert on auth.users for each row execute function public.new_profile();
-- Avoid granting users role escalation through a profile update.
create function public.guard_role() returns trigger language plpgsql security definer set search_path=public as $$begin if new.role is distinct from old.role and not is_admin() and auth.role()<>'service_role' then raise exception 'Only admins can change roles';end if;return new;end$$;
create trigger profile_role before update on public.profiles for each row execute function public.guard_role();
create function public.guard_provider() returns trigger language plpgsql security definer set search_path=public as $$begin if not is_admin() and auth.role()<>'service_role' then if tg_op='INSERT' and new.approved then raise exception 'Approval requires admin';end if;if tg_op='UPDATE' and (new.approved is distinct from old.approved or new.owner_id is distinct from old.owner_id) then raise exception 'Approval requires admin';end if;end if;return new;end$$;
create trigger provider_approval before insert or update on public.providers for each row execute function public.guard_provider();
create function public.guard_request() returns trigger language plpgsql security definer set search_path=public as $$begin if not is_admin() and auth.role()<>'service_role' then if tg_op='INSERT' then if new.status<>'pending' then raise exception 'Tin mới phải chờ duyệt';end if;if (select count(*) from event_requests where owner_id=auth.uid() and created_at>now()-interval '1 hour')>=5 then raise exception 'Vui lòng thử lại sau. Tối đa 5 nhu cầu mỗi giờ.';end if;elsif new.owner_id is distinct from old.owner_id or (new.status is distinct from old.status and new.status<>'closed') then raise exception 'Trạng thái này cần quản trị viên duyệt';end if;if tg_op='UPDATE' and (new.title,new.type,new.city,new.date,new.deadline,new.guests,new.budget,new.description,new.consent_public) is distinct from (old.title,old.type,old.city,old.date,old.deadline,old.guests,old.budget,old.description,old.consent_public) then new.status='pending';end if;end if;return new;end$$;
create trigger request_guard before insert or update on public.event_requests for each row execute function public.guard_request();
-- Enable RLS on every table, including internal queues and admin-only source data.
do $$ declare t text;begin foreach t in array array['profiles','providers','memberships','settings','payments','event_requests','proposals','replies','notifications','email_queue','facebook_groups','facebook_imports','sync_runs','audit_log'] loop execute format('alter table public.%I enable row level security',t);execute format('create policy admin_all on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())',t);end loop;end $$;
create policy self_profile_read on public.profiles for select to authenticated using(id=auth.uid());
create policy self_profile_update on public.profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
create policy directory on public.providers for select using(approved or owner_id=auth.uid());
create policy own_provider_insert on public.providers for insert to authenticated with check(owner_id=auth.uid() and not approved);
create policy own_provider_update on public.providers for update to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy own_membership on public.memberships for select to authenticated using(exists(select 1 from providers p where p.id=provider_id and p.owner_id=auth.uid()));
create policy public_settings on public.settings for select using(true);
create policy own_payment_read on public.payments for select to authenticated using(exists(select 1 from providers p where p.id=provider_id and p.owner_id=auth.uid()));
create policy own_payment_insert on public.payments for insert to authenticated with check(status='pending' and confirmed_by is null and confirmed_at is null and exists(select 1 from providers p where p.id=provider_id and p.owner_id=auth.uid()));
create policy request_read on public.event_requests for select to authenticated using(owner_id=auth.uid() or (status='open' and consent_public));
create policy request_insert on public.event_requests for insert to authenticated with check(owner_id=auth.uid() and status='pending' and consent_public);
create policy request_update on public.event_requests for update to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy proposal_read on public.proposals for select to authenticated using(exists(select 1 from providers p where p.id=provider_id and p.owner_id=auth.uid()) or exists(select 1 from event_requests r where r.id=request_id and r.owner_id=auth.uid()));
create policy reply_read on public.replies for select to authenticated using(exists(select 1 from proposals p join event_requests r on r.id=p.request_id join providers v on v.id=p.provider_id where p.id=proposal_id and (r.owner_id=auth.uid() or v.owner_id=auth.uid())));
create policy reply_insert on public.replies for insert to authenticated with check(author_id=auth.uid() and exists(select 1 from proposals p join event_requests r on r.id=p.request_id join providers v on v.id=p.provider_id where p.id=proposal_id and (r.owner_id=auth.uid() or v.owner_id=auth.uid())));
create policy notification_read on public.notifications for select to authenticated using(user_id=auth.uid());
create policy notification_update on public.notifications for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
-- Safe public projection: owner_id and personal profile data never leave this view.
-- Deliberately a definer view, restricted to consented records and explicit fields only.
create view public.public_requests as select r.id,r.title,r.type,r.city,r.date,r.deadline,r.status,r.guests,r.budget,r.description,r.created_at,(select count(*)::int from public.proposals p where p.request_id=r.id) proposals from public.event_requests r where r.status in ('open','closed') and r.consent_public;
grant select on public.public_requests to anon,authenticated;
-- Transaction + row lock prevent closing/expiry races. No direct proposal INSERT policy exists.
create function public.submit_proposal(request uuid,amount bigint,content text) returns uuid language plpgsql security definer set search_path=public as $$
declare r event_requests;v providers;pid uuid;
begin
 if auth.uid() is null then raise exception 'Vui lòng đăng nhập';end if;
 select * into r from event_requests where id=request for update;
 if r.id is null or r.status<>'open' or not r.consent_public or (r.deadline+1)::timestamp at time zone 'Asia/Ho_Chi_Minh'<=now() then raise exception 'Nhu cầu đã hết hạn hoặc đã đóng';end if;
 if r.owner_id=auth.uid() then raise exception 'Không được tự gửi đề xuất';end if;
 select * into v from providers where owner_id=auth.uid() and approved;
 if v.id is null or not exists(select 1 from memberships where provider_id=v.id and expires_at>now()) then raise exception 'Hồ sơ cần được duyệt và thành viên phải còn hạn';end if;
 if (select count(*) from proposals where provider_id=v.id and created_at>now()-interval '1 hour')>=20 then raise exception 'Tối đa 20 đề xuất mỗi giờ';end if;
 insert into proposals(request_id,provider_id,price,message) values(request,v.id,amount,content) returning id into pid;
 insert into notifications(user_id,request_id,message) values(r.owner_id,request,'Bạn nhận được đề xuất mới');
 insert into email_queue(user_id,request_id,dedupe_key) values(r.owner_id,request,'proposal:'||pid);
 return pid;
end$$;
revoke execute on function public.submit_proposal(uuid,bigint,text) from public,anon;
grant execute on function public.submit_proposal(uuid,bigint,text) to authenticated;
-- Admin confirmation extends from the greater of now or current expiry, never from client input.
create function public.confirm_membership(payment uuid) returns timestamptz language plpgsql security definer set search_path=public as $$declare p payments;expiry timestamptz;begin
 if not is_admin() then raise exception 'Forbidden';end if;
 select * into p from payments where id=payment for update;
 if p.id is null or p.status<>'pending' then raise exception 'Payment missing or already processed';end if;
 if p.amount<(select annual_fee from settings where id) then raise exception 'Số tiền không đủ phí năm';end if;
 perform pg_advisory_xact_lock(hashtext(p.provider_id::text));
 insert into memberships(provider_id,expires_at) values(p.provider_id,now()+interval '365 days') on conflict(provider_id) do update set expires_at=greatest(memberships.expires_at,now())+interval '365 days',updated_at=now() returning expires_at into expiry;
 update payments set status='confirmed',confirmed_by=auth.uid(),confirmed_at=now() where id=payment;
 insert into audit_log(actor_id,action,record_id) values(auth.uid(),'confirm_membership',payment);return expiry;end$$;
revoke execute on function public.confirm_membership(uuid) from public,anon;
grant execute on function public.confirm_membership(uuid) to authenticated;
create function public.choose_proposal(proposal uuid) returns void language plpgsql security definer set search_path=public as $$declare req uuid;begin
 select request_id into req from proposals where id=proposal;
 perform 1 from event_requests where id=req and owner_id=auth.uid() for update;
 if not found then raise exception 'Forbidden';end if;
 update proposals set selected=(id=proposal) where request_id=req;
 update event_requests set status='closed' where id=req;
end$$;
revoke execute on function public.choose_proposal(uuid) from public,anon;
grant execute on function public.choose_proposal(uuid) to authenticated;
create function public.reply_notification() returns trigger language plpgsql security definer set search_path=public as $$declare recipient uuid;req uuid;begin
 select p.request_id,case when new.author_id=r.owner_id then v.owner_id else r.owner_id end into req,recipient from proposals p join event_requests r on r.id=p.request_id join providers v on v.id=p.provider_id where p.id=new.proposal_id;
 insert into notifications(user_id,request_id,message) values(recipient,req,'Bạn nhận được phản hồi mới');
 insert into email_queue(user_id,request_id,dedupe_key) values(recipient,req,'reply:'||new.id);return new;end$$;
create trigger reply_notification after insert on public.replies for each row execute function public.reply_notification();
-- Atomic worker claim. Service role only; a lease recovers interrupted workers.
create function public.claim_emails() returns setof public.email_queue language sql security definer set search_path=public as $$update email_queue set locked_until=now()+interval '5 minutes',claim_token=gen_random_uuid(),attempts=attempts+1 where id in (select id from email_queue where sent_at is null and attempts<6 and next_attempt_at<=now() and (locked_until is null or locked_until<now()) order by created_at for update skip locked limit 10) returning *$$;
revoke execute on function public.claim_emails() from public,anon,authenticated;
grant execute on function public.claim_emails() to service_role;
create index request_feed on public.event_requests(status,created_at desc);
create index proposal_request on public.proposals(request_id);
create index email_pending on public.email_queue(next_attempt_at) where sent_at is null;
