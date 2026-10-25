"use client";

import { useState, useEffect } from "react";
import { 
  Trophy, 
  Award, 
  CheckCircle2, 
  Sparkles, 
  Star, 
  Compass, 
  ShieldCheck, 
  ArrowRight,
  TrendingUp
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  points_reward: number;
  badge_name: string | null;
  frequency: string;
}

export function ChallengesWidget() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userPoints, setUserPoints] = useState(0);
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUser(data.user);
      if (data.user) loadUserProgress(data.user.id);
    });
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("challenges")
      .select("id, title, description, category, points_reward, badge_name, frequency")
      .eq("is_active", true)
      .limit(4);

    if (data) {
      setChallenges(data as any);
    }
  };

  const loadUserProgress = async (userId: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from("user_challenges")
      .select("challenge_id, status, points_awarded")
      .eq("user_id", userId);

    if (data) {
      const map: Record<string, boolean> = {};
      let total = 0;
      data.forEach((uc) => {
        if (uc.status === "completed") {
          map[uc.challenge_id] = true;
          total += uc.points_awarded || 0;
        }
      });
      setCompletedMap(map);
      setUserPoints(total);
    }
  };

  const handleValidateChallenge = async (challenge: Challenge) => {
    if (!currentUser) {
      window.location.href = "/auth/login";
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.from("user_challenges").upsert({
      user_id: currentUser.id,
      challenge_id: challenge.id,
      status: "completed",
      progress: 100,
      points_awarded: challenge.points_reward,
      completed_at: new Date().toISOString(),
    });

    if (!error) {
      setCompletedMap((prev) => ({ ...prev, [challenge.id]: true }));
      setUserPoints((prev) => prev + challenge.points_reward);
      alert(`Félicitations ! Vous avez gagné ${challenge.points_reward} points AfriGain !`);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Défis & Badges</h4>
            <span className="text-[10px] text-slate-500">Progression utile</span>
          </div>
        </div>

        {currentUser && (
          <div className="text-right">
            <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/60">
              {userPoints} pts
            </span>
          </div>
        )}
      </div>

      <div className="space-y-2.5">
        {challenges.map((c) => {
          const isDone = completedMap[c.id];

          return (
            <div
              key={c.id}
              className={`p-2.5 rounded-xl border text-xs transition-all ${
                isDone
                  ? "bg-emerald-50/50 border-emerald-200/80 text-emerald-900"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <h5 className="font-bold text-[11px] leading-tight flex items-center gap-1">
                    {c.title}
                    {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  </h5>
                  <p className="text-[10px] text-slate-500 leading-snug">{c.description}</p>
                </div>

                <div className="shrink-0 text-right">
                  <span className="text-[10px] font-bold text-brand-600">+{c.points_reward} pts</span>
                  {!isDone && (
                    <button
                      onClick={() => handleValidateChallenge(c)}
                      className="block mt-1 text-[9px] font-bold bg-slate-900 hover:bg-slate-800 text-white px-2 py-0.5 rounded-md"
                    >
                      Valider
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-1 text-center">
        <a
          href="/dashboard"
          className="text-[11px] font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
        >
          Voir mon classement & tous les badges <ArrowRight className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
