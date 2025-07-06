import { Button } from "@/components/ui/button";
import { Edit3 } from "lucide-react";

interface ProfileCardFrontProps {
  profile: any;
  onEditClick: (e: React.MouseEvent) => void;
}

export const ProfileCardFront = ({
  profile,
  onEditClick,
}: ProfileCardFrontProps) => {
  return (
    <div className="relative w-[340px] h-[215px] p-4 rounded-xl shadow-2xl bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 text-white flex flex-col justify-between overflow-hidden">
      {/* Edit button */}
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-3 right-3 text-white hover:bg-white/20"
        onClick={onEditClick}
      >
        <Edit3 className="h-4 w-4" />
      </Button>

      {/* Top section */}
      <div>
        <h2 className="text-xl font-bold">
          {profile?.username || `${profile?.first_name} ${profile?.last_name}`}
        </h2>
        <p className="text-white/80 text-sm">Valued Customer</p>
      </div>

      {/* Bottom section */}
      <div className="flex items-center justify-between text-xs text-white/70">
        <div>
          <p className="uppercase tracking-widest font-semibold">NailBliss</p>
          <p>Loyalty Card</p>
        </div>
        <div className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white/90 shadow">
          Member
        </div>
      </div>
    </div>
  );
};
