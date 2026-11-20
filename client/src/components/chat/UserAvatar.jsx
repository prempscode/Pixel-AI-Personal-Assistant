import { useState } from "react";
import { getInitials } from "../../lib/constants";
import { cn } from "../../lib/cn";

export default function UserAvatar({ user, className }) {
  const [imageFailed, setImageFailed] = useState(false);
  const avatarUrl = user?.user_metadata?.avatar_url;
  const showImage = avatarUrl && !imageFailed;

  return (
    <span
      className={cn(
        "relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-volt text-[10px] font-bold text-ink",
        className,
      )}
      aria-hidden="true"
    >
      {!showImage && getInitials(user)}
      {showImage && (
        <img
          src={avatarUrl}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
          className="absolute inset-0 size-full object-cover"
        />
      )}
    </span>
  );
}
