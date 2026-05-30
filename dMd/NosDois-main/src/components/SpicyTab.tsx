import React, { useState } from "react";
import { Flame, Lock, Unlock, Zap, Heart, Trash2, Edit } from "lucide-react";

interface SpicyTabProps {
  currentUser: string | null;
  partnerUser: any;
  state: any;
  triggerCustomNotify: (msg: string, type: "success" | "error" | "info") => void;
  onRefresh: () => void;
  handleAction: (endpoint: string, payload: any) => Promise<any>;
}

export default function SpicyTab({ currentUser, partnerUser, state, triggerCustomNotify, onRefresh, handleAction }: SpicyTabProps) {
  const [addingWish, setAddingWish] = useState(false);
  const [newWish, setNewWish] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  
  const [activeScratchCard, setActiveScratchCard] = useState<string | null>(null);
  
  const spicyCheckins = state.spicyCheckins || [];
  const secretWishes = state.secretWishes || [];
  
  const partnerName = partnerUser?.name || "Parceiro(a)";
  const todayStr = new Date().toISOString().split("T")[0];
  const myCheckin = spicyCheckins.find((c: any) => c.user_id === currentUser && c.date === todayStr);
  const partnerCheckin = spicyCheckins.find((c: any) => c.user_id !== currentUser && c.date === todayStr);

  const myCoins = currentUser && state.users?.[currentUser]?.coins ? state.users[currentUser].coins : 0;

  const NORMAL_QUESTS = state.quests || [];
  
  // Weekly Special Quest generator based on week number
  const weekNumber = Math.floor(Date.now() / (7 * 86400000));
  const hasSpicyQuest = NORMAL_QUESTS.some((q:any) => q.isSpicy && q.weekId === weekNumber);
  
  const SPECIAL_QUEST = {
    title: "Quest de Sexta: Banho à Luz de Velas 🕯️",
    desc: "Tomar banho juntos no escuro, apenas com velas iluminando, sem pressa e focados um no outro.",
    points: 150,
    coins: 100,
    isSpicy: true,
    weekId: weekNumber
  };

  const BLACK_MARKET_ITEMS = [
    { title: "Vale Striptease Exclusivo 💃🏽", cost: 300, icon: "👙" },
    { title: "Massagem Sensual Completa 💆‍♀️", cost: 400, icon: "🧴" },
    { title: "Noite Sem Limites (Você Manda!) 🔥", cost: 1000, icon: "👑" },
    { title: "Comprar Lingerie Nova Surpresa 🛍️", cost: 500, icon: "✨" }
  ];

  const handleBuyBlackMarket = async (title: string, cost: number) => {
    if (myCoins < cost) {
      triggerCustomNotify(`Faltam moedas! Você tem ${myCoins}/${cost} 🪙`, "error");
      return;
    }
    const c = confirm(`Deseja comprar '${title}' por ${cost} moedas? Você tem ${myCoins}.`);
    if (!c) return;
    
    try {
      const res = await handleAction("/api/spicy/buy-reward", { user_id: currentUser, title, cost });
      if (res.success) {
        triggerCustomNotify(res.message || "Compra realizada!", "success");
        onRefresh();
      } else {
        triggerCustomNotify(res.error || "Erro ao comprar.", "error");
      }
    } catch (e) {
      triggerCustomNotify("Erro ao processar compra.", "error");
    }
  };

  const handleStartSpicyQuest = async () => {
    try {
      await handleAction("/api/quests/create", {
        title: SPECIAL_QUEST.title,
        desc: SPECIAL_QUEST.desc,
        points: SPECIAL_QUEST.points,
        coins: SPECIAL_QUEST.coins,
        type: "Intimidade",
        isSpicy: true,
        weekId: weekNumber,
        category: "relationship"
      });
      triggerCustomNotify("Quest de Intimidade Ativada na lista geral! 🚀", "success");
      onRefresh();
    } catch (e) {
      triggerCustomNotify("Erro ao iniciar quest.", "error");
    }
  };

  const SCRATCH_CARDS = [
    { title: "Vale Massagem Sensual 💆‍♀️", description: "O mozão deverá fazer uma massagem de pelo menos 15 minutos em você esta noite." },
    { title: "Foco Total em mim 🎯", description: "Esta noite o foco é 100% no seu prazer. O mozão precisa usar a criatividade." },
    { title: "Jantar Romântico Nu(a) 🍷", description: "Vocês devem jantar apenas com roupas íntimas ou totalmente nus antes de irem pro quarto." },
    { title: "Fantasia Surpresa 🎭", description: "Você pode escolher uma fantasia ou roupa que o mozão deve usar na hora H hoje." },
    { title: "Ação Rápida ⚡", description: "Linguagem corporal ativada. Vocês têm 10 minutos para dar uma 'rapidinha' onde estiverem agora!" }
  ];

  const handleUpdateCheckin = async (level: number) => {
    try {
      await handleAction("/api/spicy/checkin", { user_id: currentUser, level, note: "" });
      triggerCustomNotify("Termômetro atualizado!", "success");
      onRefresh();
    } catch (e) {
      triggerCustomNotify("Erro ao atualizar", "error");
    }
  };

  const handleAddWish = async () => {
    if (!newWish) return;
    try {
      await handleAction("/api/spicy/wishes/create", { user_id: currentUser, text: newWish, is_anonymous: isAnonymous });
      triggerCustomNotify("Desejo salvo na caixa secreta!", "success");
      setAddingWish(false);
      setNewWish("");
      setIsAnonymous(false);
      onRefresh();
    } catch (e) {
      triggerCustomNotify("Erro ao salvar.", "error");
    }
  };

  const handleDeleteWish = async (id: string) => {
    try {
      await handleAction("/api/spicy/wishes/delete", { id });
      triggerCustomNotify("Desejo deletado.", "success");
      onRefresh();
    } catch (e) {
      triggerCustomNotify("Erro.", "error");
    }
  };

  const handleToggleWish = async (id: string) => {
    try {
      await handleAction("/api/spicy/wishes/toggle", { id });
      onRefresh();
    } catch (e) {
      triggerCustomNotify("Erro.", "error");
    }
  };

  const randomCard = () => {
    const pick = SCRATCH_CARDS[Math.floor(Math.random() * SCRATCH_CARDS.length)];
    setActiveScratchCard(pick.title + " - " + pick.description);
  };

  return (
    <div className="flex flex-col gap-6" id="subview-spicy">
      
      {/* Header section */}
      <div>
        <h3 className="font-bold text-red-600 dark:text-red-400 text-lg font-display flex items-center gap-2">
          <Flame className="w-5 h-5" /> Termômetro da Intimidade
        </h3>
        <p className="text-xs text-red-900/60 dark:text-red-200 mt-1">Conectem-se em um nível mais profundo e compartilhem suas fantasias e níveis de desejo.</p>
      </div>

      {/* 1. TERMÔMETRO */}
      <div className="bg-gradient-to-r from-red-500 to-rose-600 rounded-3xl p-5 text-white shadow-xl">
        <h4 className="font-extrabold mb-3 text-sm flex items-center gap-2 uppercase tracking-wide">
          <Heart className="w-4 h-4 fill-white text-white" /> Qual é o nível de desejo para hoje?
        </h4>
        
        <div className="flex gap-2 mb-4">
          {[
            { level: 1, label: "Frio 🧊", color: "from-blue-400 to-cyan-500", active: myCheckin?.level === 1 },
            { level: 2, label: "Morno 🌤️", color: "from-orange-400 to-amber-500", active: myCheckin?.level === 2 },
            { level: 3, label: "Pegando Fogo 🔥", color: "from-red-600 to-rose-700", active: myCheckin?.level === 3 }
          ].map(opt => (
            <button
              key={opt.level}
              onClick={() => handleUpdateCheckin(opt.level)}
              className={`flex-1 bg-gradient-to-br ${opt.active ? opt.color + " ring-2 ring-white scale-105" : "from-black/20 to-black/30 opacity-70 hover:opacity-100"} p-3 rounded-2xl flex flex-col items-center justify-center transition-all shadow-md`}
            >
              <span className="text-sm font-bold">{opt.label}</span>
            </button>
          ))}
        </div>

        {/* Parceiro */}
        <div className="bg-black/20 p-3 rounded-xl border border-white/10 flex items-center justify-between">
          <div className="text-sm">
            O termômetro do(a) <span className="font-bold">{partnerName}</span> está:
          </div>
          <div className="font-bold">
            {partnerCheckin ? (
              partnerCheckin.level === 1 ? "Frio 🧊" :
              partnerCheckin.level === 2 ? "Morno 🌤️" : "Pegando Fogo 🔥"
            ) : "Nenhuma pista... 🕵️‍♀️"}
          </div>
        </div>
      </div>

      {/* 2. CAIXA DE DESEJOS */}
      <div className="border border-red-100 dark:border-rose-900/40 bg-red-50/30 dark:bg-red-950/20 p-5 rounded-3xl">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-red-900 dark:text-red-100 flex items-center gap-2">
            <Lock className="w-4 h-4" /> Caixa de Desejos Secretos
          </h4>
          <button 
            onClick={() => setAddingWish(!addingWish)}
            className="bg-red-600 text-white p-2 rounded-xl hover:bg-red-700 shadow-md transition"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>

        {addingWish && (
          <div className="mb-4 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-red-100 dark:border-red-900">
            <textarea
              value={newWish}
              onChange={e => setNewWish(e.target.value)}
              placeholder="Descreva sua fantasia ou desejo..."
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500 min-h-[80px]"
            />
            <div className="flex items-center justify-between mt-3">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <input 
                  type="checkbox" 
                  checked={isAnonymous}
                  onChange={e => setIsAnonymous(e.target.checked)}
                  className="accent-red-500 w-4 h-4"
                />
                Enviar anonimamente
              </label>
              <button 
                onClick={handleAddWish}
                className="bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-700"
              >
                Depositar Desejo
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {secretWishes.length === 0 ? (
            <div className="bg-red-100/50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-2xl text-center text-sm font-medium">
              A caixa misteriosa está vazia... Seja o primeiro a depositar uma fantasia! 😉
            </div>
          ) : (
            secretWishes.map((w: any) => (
              <div key={w.id} className={`p-4 rounded-2xl border transition ${w.fulfilled ? 'bg-green-50 dark:bg-green-900/20 border-green-200' : 'bg-white dark:bg-slate-900 border-red-100 dark:border-red-900/50'} shadow-sm`}>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex flex-col gap-1 w-full">
                    <span className="text-[10px] uppercase font-extrabold text-red-500 tracking-wider">
                      {w.is_anonymous ? "Desejo Anônimo 🤫" : `Por: ${w.user_id === currentUser ? "Você" : partnerName}`}
                    </span>
                    <p className={`text-sm ${w.fulfilled ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200 font-medium'}`}>
                      {w.text}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button 
                      onClick={() => handleToggleWish(w.id)}
                      className={`p-2 rounded-full ${w.fulfilled ? 'bg-green-100 text-green-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'} hover:scale-105 transition`}
                      title={w.fulfilled ? "Realizado!" : "Marcar como realizado"}
                    >
                      {w.fulfilled ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    </button>
                    {(w.user_id === currentUser || w.fulfilled) && (
                      <button 
                        onClick={() => handleDeleteWish(w.id)}
                        className="p-2 rounded-full bg-red-50 dark:bg-red-900/30 text-red-600 hover:scale-105 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. RASPADINHA (ROLEPLAY / CARD CHALLENGE) */}
      <div className="bg-black text-white p-6 rounded-3xl overflow-hidden relative shadow-xl border border-red-900">
        <div className="absolute right-0 top-0 w-32 h-32 bg-red-600 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
        <div className="absolute left-0 bottom-0 w-32 h-32 bg-purple-600 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col items-center justify-center text-center gap-4">
          <div>
            <span className="bg-red-600 text-white text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full mb-2 inline-block">
              Surpresa
            </span>
            <h4 className="font-display text-xl font-bold">Roleta Picante 🌶️</h4>
            <p className="text-xs text-slate-400 max-w-[250px] mx-auto mt-1">Quer deixar o acaso decidir as regras de hoje? Gire a roleta de desafios hot!</p>
          </div>

          {activeScratchCard ? (
            <div className="bg-white/10 border border-red-500 p-5 rounded-2xl mt-2 flex flex-col gap-3 animate-fade-in">
              <span className="text-xl">{activeScratchCard.split(' - ')[0]}</span>
              <p className="text-sm font-semibold">{activeScratchCard.split(' - ')[1]}</p>
              <button 
                onClick={() => setActiveScratchCard(null)}
                className="mt-2 text-xs text-red-300 underline font-medium cursor-pointer"
              >
                Esconder
              </button>
            </div>
          ) : (
            <button 
              onClick={randomCard}
              className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-red-600/30 flex items-center gap-2 transition"
            >
              <Zap className="w-5 h-5 fill-white" /> Sortear Desafio Agora!
            </button>
          )}
        </div>
      </div>

      {/* 4. QUESTS +18 (MISSÃO SURPRESA) */}
      <div className="border-2 border-red-200/50 dark:border-rose-900/50 bg-red-50/50 dark:bg-rose-950/20 p-5 rounded-3xl relative overflow-hidden">
        <h4 className="font-bold text-red-900 dark:text-red-100 flex items-center gap-2 mb-3 relative z-10">
          <Heart className="w-4 h-4 text-red-500 fill-red-500" /> Missão Especial +18 🎯
        </h4>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-red-100 dark:border-red-900 shadow-sm relative z-10">
          <div className="flex flex-col gap-1">
            <h5 className="font-bold text-slate-800 dark:text-slate-100">{SPECIAL_QUEST.title}</h5>
            <p className="text-xs text-slate-500 line-clamp-2">{SPECIAL_QUEST.desc}</p>
          </div>
          <div className="flex gap-2 mt-3 items-center">
             <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold">+{SPECIAL_QUEST.coins} Moedas</span>
             <span className="bg-violet-100 text-violet-800 px-2 py-0.5 rounded text-[10px] font-bold">+{SPECIAL_QUEST.points} XP Coop</span>
          </div>
          {!hasSpicyQuest ? (
            <button
              onClick={handleStartSpicyQuest}
              className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl uppercase text-xs tracking-wider transition"
            >
              Aceitar Missão Especial
            </button>
          ) : (
             <button
              disabled
              className="mt-4 w-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-bold py-2.5 rounded-xl uppercase text-xs tracking-wider cursor-not-allowed"
            >
              Missão Ativa na Tela Principal
            </button>
          )}
        </div>
      </div>

      {/* 5. LOJA DE RECOMPENSAS SECUNDÁRIA (MERCADO NEGRO) */}
      <div className="bg-slate-900 text-slate-100 p-6 rounded-3xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 100% 0%, red 0%, transparent 50%)' }}></div>
        <div className="relative z-10 flex items-center justify-between mb-4 border-b border-white/10 pb-4">
          <div>
            <h4 className="font-bold text-red-500 flex items-center gap-2 text-lg">
              <Lock className="w-5 h-5" /> Mercado Negro (Loja Pimenta)
            </h4>
            <p className="text-xs text-slate-400 mt-1">Exija mais colaboração no dia a dia para conquistar estes prêmios ousados.</p>
          </div>
          <div className="bg-amber-500/20 text-amber-500 px-3 py-2 rounded-xl text-center border border-amber-500/30">
            <span className="text-xs font-bold uppercase tracking-wider block">Seu Saldo</span>
            <span className="text-lg font-black">{myCoins} 🪙</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {BLACK_MARKET_ITEMS.map(item => (
            <div key={item.title} className="bg-slate-800 border border-slate-700 p-4 rounded-2xl flex flex-col justify-between hover:border-red-500/50 transition">
              <div>
                <span className="text-2xl mb-2 block">{item.icon}</span>
                <h5 className="font-bold text-sm leading-tight text-white">{item.title}</h5>
              </div>
              <button
                onClick={() => handleBuyBlackMarket(item.title, item.cost)}
                className="mt-4 bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/30 font-bold px-3 py-2 rounded-xl text-xs flex justify-between items-center transition"
              >
                <span>Comprar</span>
                <span className="bg-red-950 px-2 py-0.5 rounded text-red-400">{item.cost} 🪙</span>
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
