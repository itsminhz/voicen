import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { modelenceQuery, modelenceMutation, createQueryKey } from '@modelence/react-query';
import { useSession } from 'modelence/client';
import { Check, LogOut } from 'lucide-react';
import avatarMale from '@/client/assets/avatar-male.png';
import avatarFemale from '@/client/assets/avatar-female.png';
import { cn } from '@/client/lib/utils';

type Gender = 'male' | 'female';

const AVATARS: Record<Gender, string> = {
  male: avatarMale,
  female: avatarFemale,
};

export default function UserMenu() {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    ...modelenceQuery<{ gender: Gender | null }>('profile.get'),
    enabled: !!user,
  });

  const { mutate: setGender } = useMutation({
    ...modelenceMutation('profile.setGender'),
    onMutate: async ({ gender }: { gender: Gender }) => {
      queryClient.setQueryData(createQueryKey('profile.get'), { gender });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: createQueryKey('profile.get') });
    },
  });

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  if (!user) return null;

  const gender: Gender = data?.gender ?? 'male';

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
        aria-label="Open user menu"
      >
        <img
          src={AVATARS[gender]}
          alt="Profile"
          className="h-9 w-9 rounded-full border border-line shadow-sm"
        />
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-56 animate-slide-up-sm rounded-xl border border-line bg-surface p-2 shadow-lg">
          <div className="px-2.5 py-2">
            <p className="truncate text-sm font-medium text-ink">{user.handle}</p>
          </div>
          <div className="my-1 h-px bg-line" />
          <p className="px-2.5 pb-1.5 pt-1 text-[11px] font-medium uppercase tracking-wider text-ink-faint">
            Avatar
          </p>
          <div className="flex gap-2 px-2.5 pb-2">
            {(Object.keys(AVATARS) as Gender[]).map((g) => (
              <button
                key={g}
                onClick={() => setGender({ gender: g })}
                className={cn(
                  'relative rounded-full transition-all hover:scale-105',
                  gender === g ? 'ring-2 ring-ink ring-offset-2 ring-offset-surface' : 'opacity-70 hover:opacity-100'
                )}
                aria-label={g === 'male' ? 'Male avatar' : 'Female avatar'}
              >
                <img src={AVATARS[g]} alt="" className="h-10 w-10 rounded-full border border-line" />
                {gender === g && (
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-ink text-surface">
                    <Check className="h-2.5 w-2.5" strokeWidth={3} />
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="my-1 h-px bg-line" />
          <Link
            to="/logout"
            className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-ink-soft transition-colors hover:bg-paper-dim hover:text-ink"
            onClick={() => setOpen(false)}
          >
            <LogOut className="h-4 w-4" />
            Log out
          </Link>
        </div>
      )}
    </div>
  );
}
