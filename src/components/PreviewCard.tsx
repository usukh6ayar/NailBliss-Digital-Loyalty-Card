import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export const PreviewCard = ({
  username,
  gradient,
}: {
  username: string;
  gradient: string;
}) => {
  return (
    <div
      className={`w-64 h-40 rounded-xl shadow-xl p-4 text-white bg-gradient-to-br ${gradient} flex flex-col justify-between`}
    >
      <div className="flex items-center space-x-3">
        <div>
          <p className="text-sm font-semibold">{username || "Username"}</p>
          <p className="text-xs text-white/80">Loyalty Member</p>
        </div>
      </div>

      <div className="flex justify-between text-xs text-white/70">
        <span>NailBliss</span>
        <span>5 visits = 50% off</span>
      </div>
    </div>
  );
};
