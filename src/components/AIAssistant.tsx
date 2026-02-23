"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, Sparkles, TrendingDown, TrendingUp, Target, Lightbulb, RefreshCw } from "lucide-react";
import { AppData } from "@/lib/types";

interface AIAssistantProps {
  data: AppData;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// ─── Financial analysis helpers ───────────────────────────────────────────────

function analyzeData(data: AppData) {
  const totalIncome = data.transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);

  const totalExpenses = data.transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  // Expenses by category
  const byCategory: Record<string, number> = {};
  data.transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      byCategory[t.category] = (byCategory[t.category] ?? 0) + t.amount;
    });

  // Card expenses total
  const cardTotal = data.cardExpenses.reduce((s, e) => s + e.amount, 0);

  // Goals progress
  const goalsProgress = data.goals.map((g) => ({
    name: g.name,
    pct: Math.round((g.currentAmount / g.targetAmount) * 100),
    remaining: g.targetAmount - g.currentAmount,
    monthly: g.monthlyTarget,
  }));

  // Top spending category
  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];

  // Savings rate
  const savingsRate = totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0;

  return {
    totalIncome,
    totalExpenses,
    balance,
    byCategory,
    cardTotal,
    goalsProgress,
    topCategory,
    savingsRate,
  };
}

const categoryLabels: Record<string, string> = {
  salary: "Salário",
  freelance: "Freelance",
  investment: "Investimentos",
  other_income: "Outras receitas",
  food: "Alimentação",
  transport: "Transporte",
  housing: "Moradia",
  health: "Saúde",
  education: "Educação",
  entertainment: "Entretenimento",
  clothing: "Roupas",
  utilities: "Contas/Utilidades",
  other_expense: "Outros gastos",
};

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ─── AI response engine (rule-based, no external API) ─────────────────────────

function generateResponse(userMessage: string, data: AppData): string {
  const msg = userMessage.toLowerCase().trim();
  const a = analyzeData(data);

  // ── Greetings ──
  if (/^(oi|olá|ola|hey|hello|bom dia|boa tarde|boa noite|tudo bem|e aí|eai)/.test(msg)) {
    return `Olá! 👋 Sou seu assistente financeiro pessoal. Estou aqui para te ajudar a entender melhor suas finanças e tomar decisões mais inteligentes com seu dinheiro.\n\nPosso te ajudar com:\n• 📊 Análise dos seus gastos\n• 💡 Dicas para economizar\n• 🎯 Estratégias para suas metas\n• 📈 Sugestões de investimento\n• 🔴 Como sair do vermelho\n\nO que você gostaria de saber?`;
  }

  // ── Balance / overview ──
  if (/saldo|balanço|balanco|situação|situacao|resumo|overview|como (estou|tô|to)|financ/.test(msg)) {
    const status = a.balance >= 0 ? "positivo ✅" : "negativo ⚠️";
    const tip =
      a.balance < 0
        ? `\n\n⚠️ **Atenção:** Você está gastando mais do que ganha. Prioridade: cortar gastos em **${categoryLabels[a.topCategory?.[0]] ?? "diversas categorias"}** (${fmt(a.topCategory?.[1] ?? 0)}).`
        : a.savingsRate < 10
        ? `\n\n💡 Sua taxa de poupança é de apenas **${a.savingsRate}%**. O ideal é poupar pelo menos 20% da renda.`
        : `\n\n🎉 Parabéns! Você está poupando **${a.savingsRate}%** da sua renda — acima da média brasileira!`;

    return `📊 **Resumo Financeiro**\n\n• Receitas totais: **${fmt(a.totalIncome)}**\n• Despesas totais: **${fmt(a.totalExpenses)}**\n• Saldo: **${fmt(a.balance)}** (${status})\n• Taxa de poupança: **${a.savingsRate}%**\n• Gastos no cartão: **${fmt(a.cardTotal)}**${tip}`;
  }

  // ── Spending / where money goes ──
  if (/gast(o|os|ei|ando)|despesa|onde (vai|gasto|estou)|mais (gasto|caro)|categoria/.test(msg)) {
    const sorted = Object.entries(a.byCategory).sort((x, y) => y[1] - x[1]);
    if (sorted.length === 0) {
      return "Você ainda não tem despesas registradas. Adicione seus gastos na aba **Lançamentos** para eu poder analisar!";
    }
    const list = sorted
      .slice(0, 5)
      .map(([cat, val], i) => `${i + 1}. ${categoryLabels[cat] ?? cat}: **${fmt(val)}** (${Math.round((val / a.totalExpenses) * 100)}%)`)
      .join("\n");

    const topCat = sorted[0];
    const advice =
      topCat[0] === "housing"
        ? "Moradia acima de 30% da renda é um sinal de alerta. Considere renegociar o aluguel ou buscar alternativas."
        : topCat[0] === "food"
        ? "Alimentação é seu maior gasto. Cozinhar em casa pode reduzir esse custo em até 60%."
        : topCat[0] === "entertainment"
        ? "Entretenimento é seu maior gasto. Revise assinaturas e serviços que você não usa com frequência."
        : topCat[0] === "transport"
        ? "Transporte pesa bastante. Considere transporte público, carona ou trabalho remoto para reduzir."
        : `Fique de olho em **${categoryLabels[topCat[0]] ?? topCat[0]}** — é onde você mais gasta.`;

    return `💸 **Onde vai seu dinheiro**\n\n${list}\n\n💡 **Dica:** ${advice}`;
  }

  // ── How to save money ──
  if (/economiz|poupar|poupança|guardar dinheiro|cortar|reduzir|menos gast/.test(msg)) {
    return `💰 **Como economizar mais**\n\n**Regra 50/30/20:**\n• 50% para necessidades (moradia, comida, saúde)\n• 30% para desejos (lazer, roupas, restaurantes)\n• 20% para poupança e investimentos\n\n**Ações práticas para você:**\n1. 🛒 Faça lista antes de ir ao mercado — evita compras por impulso\n2. 📱 Revise assinaturas mensais (streaming, apps) — cancele o que não usa\n3. 🍳 Cozinhe mais em casa — pode economizar R$ 300–600/mês\n4. 🚗 Agrupe tarefas para reduzir deslocamentos\n5. 💳 Evite parcelamentos — juros do cartão chegam a 400% ao ano\n6. 🏷️ Compare preços antes de comprar (Buscapé, Google Shopping)\n\n**Seu potencial de economia estimado:** ${fmt(a.totalExpenses * 0.15)}/mês (15% das despesas)`;
  }

  // ── In the red / debt ──
  if (/vermelho|dívida|divida|devendo|negativo|endividado|sair do buraco|quitar/.test(msg)) {
    const isNegative = a.balance < 0;
    if (isNegative) {
      return `🔴 **Plano para sair do vermelho**\n\nSeu saldo atual é **${fmt(a.balance)}**. Aqui está o plano:\n\n**Passo 1 — Pare de acumular dívidas**\n• Não faça novas compras parceladas\n• Use o cartão só para o essencial\n\n**Passo 2 — Liste todas as dívidas**\n• Anote valor, juros e prazo de cada uma\n• Priorize as de maior juros (cartão de crédito primeiro!)\n\n**Passo 3 — Corte gastos imediatamente**\n• Identifique os 3 maiores gastos não essenciais\n• Reduza ou elimine por 3 meses\n\n**Passo 4 — Aumente a renda**\n• Freelance, venda de itens não usados, hora extra\n• Cada R$ 100 extra acelera sua recuperação\n\n**Passo 5 — Negocie**\n• Bancos preferem negociar a não receber\n• Peça desconto para pagamento à vista\n\n💪 Com disciplina, você consegue reverter isso em 3–6 meses!`;
    } else {
      return `✅ Boas notícias: seu saldo está **positivo** (${fmt(a.balance)})!\n\nMas para se blindar contra o vermelho:\n\n1. 🛡️ **Reserva de emergência** — guarde 3–6 meses de despesas (meta: ${fmt(a.totalExpenses * 4)})\n2. 💳 **Evite dívidas de alto custo** — cartão rotativo e cheque especial têm juros absurdos\n3. 📊 **Monitore mensalmente** — use este app para acompanhar seu progresso\n4. 🎯 **Mantenha suas metas** — você já tem ${a.goalsProgress.length} meta(s) ativas!`;
    }
  }

  // ── Investments ──
  if (/invest|aplicar|render|renda fixa|tesouro|ações|acoes|fundo|cdb|lci|lca|cripto|bolsa/.test(msg)) {
    return `📈 **Guia de Investimentos para Iniciantes**\n\n**Antes de investir, tenha:**\n✅ Reserva de emergência (3–6 meses de gastos)\n✅ Dívidas de alto custo quitadas\n✅ Orçamento equilibrado\n\n**Opções por perfil:**\n\n🟢 **Conservador (seguro)**\n• Tesouro Selic — rende ~10,5% ao ano, liquidez diária\n• CDB de banco grande — 100–110% do CDI\n• LCI/LCA — isentos de IR, bons para médio prazo\n\n🟡 **Moderado (equilíbrio)**\n• Fundos multimercado — diversificação automática\n• Tesouro IPCA+ — protege da inflação no longo prazo\n• FIIs (Fundos Imobiliários) — renda mensal de aluguéis\n\n🔴 **Arrojado (maior risco/retorno)**\n• Ações de empresas sólidas (VALE, ITUB, PETR)\n• ETFs (BOVA11) — investe em toda a bolsa de uma vez\n• Criptomoedas — alta volatilidade, só com dinheiro que pode perder\n\n💡 **Regra de ouro:** Comece com Tesouro Selic e vá diversificando conforme aprende!`;
  }

  // ── Goals ──
  if (/meta|objetivo|sonho|planejamento|plano|prazo/.test(msg)) {
    if (a.goalsProgress.length === 0) {
      return `🎯 Você ainda não tem metas cadastradas!\n\nVá até a aba **Metas** e crie seus objetivos financeiros. Ter metas claras aumenta em 42% a chance de você alcançá-las (segundo estudos de psicologia financeira).\n\nExemplos de metas:\n• 🛡️ Reserva de emergência\n• ✈️ Viagem dos sonhos\n• 🏠 Entrada do imóvel\n• 🚗 Troca de carro\n• 📚 Curso/especialização`;
    }
    const list = a.goalsProgress
      .map((g) => `• **${g.name}**: ${g.pct}% concluído — faltam ${fmt(g.remaining)} (${fmt(g.monthly)}/mês)`)
      .join("\n");

    const slowGoal = a.goalsProgress.find((g) => g.pct < 30);
    const tip = slowGoal
      ? `\n\n💡 A meta **${slowGoal.name}** está com progresso baixo (${slowGoal.pct}%). Tente aumentar a contribuição mensal para ${fmt(slowGoal.monthly * 1.5)}.`
      : "\n\n🎉 Suas metas estão progredindo bem! Continue assim!";

    return `🎯 **Suas Metas Financeiras**\n\n${list}${tip}`;
  }

  // ── Credit card ──
  if (/cartão|cartao|fatura|limite|crédito|credito|parcel/.test(msg)) {
    const cardNames = data.cards.map((c) => c.name).join(", ");
    return `💳 **Seus Cartões de Crédito**\n\nVocê tem ${data.cards.length} cartão(ões): **${cardNames}**\nTotal de gastos no cartão: **${fmt(a.cardTotal)}**\n\n**Boas práticas com cartão:**\n1. 💰 Pague sempre o valor total da fatura — o rotativo cobra até 400% ao ano\n2. 📅 Conheça sua data de fechamento — compras após o fechamento só vencem no mês seguinte\n3. 🎯 Use o limite como referência, não como dinheiro disponível\n4. 🔔 Ative alertas de gastos no app do banco\n5. 🚫 Evite saques no crédito — juros altíssimos\n\n💡 **Dica:** Tente manter os gastos no cartão abaixo de 30% do seu limite total.`;
  }

  // ── Tips / general advice ──
  if (/dica|conselho|ajuda|sugestão|sugestao|como melhorar|o que fazer/.test(msg)) {
    return `💡 **Dicas Financeiras Personalizadas**\n\nBaseado no seu perfil:\n\n${a.savingsRate < 10 ? "🔴 **Urgente:** Sua taxa de poupança está abaixo de 10%. Tente chegar a 20%." : a.savingsRate < 20 ? "🟡 **Atenção:** Sua taxa de poupança é de " + a.savingsRate + "%. O ideal é 20%+." : "🟢 **Ótimo:** Você está poupando " + a.savingsRate + "% da renda!"}\n\n**Top 5 ações para esta semana:**\n1. 📋 Revise seus gastos dos últimos 30 dias\n2. ✂️ Cancele 1 assinatura que você não usa\n3. 🛒 Planeje as compras do mercado com lista\n4. 💰 Transfira ${fmt(Math.max(a.totalIncome * 0.1, 50))} para poupança hoje\n5. 📚 Leia 15 min sobre finanças pessoais (livro: "Pai Rico Pai Pobre" ou "O Homem Mais Rico da Babilônia")\n\n**Regras de ouro:**\n• Pague-se primeiro (poupe antes de gastar)\n• Nunca gaste mais do que ganha\n• Invista regularmente, mesmo que pouco`;
  }

  // ── Income increase ──
  if (/renda|salário|salario|ganhar mais|aumentar|extra|freelance|renda extra/.test(msg)) {
    return `💼 **Como Aumentar sua Renda**\n\n**Renda ativa (troca tempo por dinheiro):**\n• 💻 Freelance na sua área de expertise\n• 🎓 Aulas particulares ou cursos online\n• 🚗 Motorista de app nos fins de semana\n• 📦 Entregador / serviços por demanda\n• 🛍️ Venda de produtos artesanais ou revendas\n\n**Renda passiva (dinheiro trabalhando por você):**\n• 📈 Dividendos de ações e FIIs\n• 🏠 Aluguel de imóvel ou quarto\n• 📝 Conteúdo digital (YouTube, blog, e-book)\n• 🤝 Marketing de afiliados\n\n**Valorize-se no trabalho atual:**\n• Peça aumento com dados concretos de resultados\n• Busque certificações e cursos relevantes\n• Expanda sua rede de contatos (networking)\n\n💡 Aumentar a renda em R$ 500/mês pode acelerar suas metas em ${Math.round(500 / (a.goalsProgress[0]?.monthly || 500) * 100)}%!`;
  }

  // ── Emergency fund ──
  if (/reserva|emergência|emergencia|fundo|segurança|seguranca/.test(msg)) {
    const target = a.totalExpenses * 4; // 4 months of expenses
    return `🛡️ **Reserva de Emergência**\n\nA reserva de emergência é a base de qualquer planejamento financeiro sólido.\n\n**Quanto guardar:**\n• Mínimo: 3 meses de despesas = **${fmt(a.totalExpenses * 3)}**\n• Ideal: 6 meses de despesas = **${fmt(target)}**\n• Para autônomos: 12 meses = **${fmt(a.totalExpenses * 12)}**\n\n**Onde guardar:**\n✅ Tesouro Selic (melhor opção — rende e tem liquidez diária)\n✅ CDB com liquidez diária de banco grande\n✅ Conta remunerada (Nubank, Inter, C6)\n❌ Poupança (rende menos que a inflação)\n❌ Investimentos de risco (pode precisar na hora errada)\n\n**Como construir:**\n• Separe um valor fixo todo mês (ex: ${fmt(Math.max(a.totalIncome * 0.1, 100))})\n• Automatize a transferência no dia do salário\n• Não toque nesse dinheiro — só para emergências reais!`;
  }

  // ── Default / fallback ──
  const suggestions = [
    "📊 análise dos meus gastos",
    "💡 dicas para economizar",
    "📈 como investir meu dinheiro",
    "🎯 progresso das minhas metas",
    "🔴 como sair do vermelho",
    "💳 dicas sobre cartão de crédito",
    "🛡️ reserva de emergência",
    "💼 como aumentar minha renda",
  ];

  return `Não entendi muito bem sua pergunta 😅 Mas posso te ajudar com:\n\n${suggestions.map((s) => `• ${s}`).join("\n")}\n\nTente perguntar algo como: *"Onde estou gastando mais?"* ou *"Como posso economizar?"*`;
}

// ─── Quick suggestion chips ────────────────────────────────────────────────────

const quickSuggestions = [
  { label: "📊 Meu resumo financeiro", msg: "Como está minha situação financeira?" },
  { label: "💸 Onde gasto mais?", msg: "Onde estou gastando mais dinheiro?" },
  { label: "💡 Dicas para economizar", msg: "Me dê dicas para economizar" },
  { label: "📈 Como investir?", msg: "Como devo investir meu dinheiro?" },
  { label: "🎯 Minhas metas", msg: "Como estão minhas metas financeiras?" },
  { label: "🔴 Sair do vermelho", msg: "Como posso sair do vermelho?" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function AIAssistant({ data }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Olá! 👋 Sou seu **Assistente Financeiro IA**.\n\nAnaliso seus dados em tempo real e ofereço dicas personalizadas para te ajudar a:\n• 💰 Economizar mais\n• 📈 Investir melhor\n• 🎯 Alcançar suas metas\n• 🔴 Sair do vermelho\n\nComo posso te ajudar hoje?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const msgCounter = useRef(0);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const uid = `msg-${(msgCounter.current += 1)}`;
    const userMsg: Message = {
      id: uid,
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Fixed delay to avoid impure Math.random during render
    const delay = 900;
    setTimeout(() => {
      const response = generateResponse(trimmed, data);
      const aiMsg: Message = {
        id: `${uid}-reply`,
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, delay);
  }, [data]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  function clearChat() {
    const uid = `welcome-${(msgCounter.current += 1)}`;
    setMessages([
      {
        id: uid,
        role: "assistant",
        content: `Chat reiniciado! 🔄 Como posso te ajudar?`,
        timestamp: new Date(),
      },
    ]);
  }

  // Render markdown-like bold (**text**) and line breaks
  function renderContent(text: string) {
    return text.split("\n").map((line, i) => {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <span key={i}>
          {parts.map((part, j) =>
            j % 2 === 1 ? (
              <strong key={j} style={{ color: "#f1f5f9", fontWeight: 700 }}>
                {part}
              </strong>
            ) : (
              <span key={j}>{part}</span>
            )
          )}
          {i < text.split("\n").length - 1 && <br />}
        </span>
      );
    });
  }

  const a = analyzeData(data);

  return (
    <div style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Bot size={24} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#f1f5f9", margin: 0 }}>
              Assistente Financeiro IA
            </h1>
            <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
              Análise personalizada dos seus dados em tempo real
            </p>
          </div>
          <button
            onClick={clearChat}
            title="Limpar conversa"
            style={{
              marginLeft: "auto",
              background: "transparent",
              border: "1px solid #334155",
              borderRadius: "8px",
              padding: "8px",
              cursor: "pointer",
              color: "#64748b",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
            }}
          >
            <RefreshCw size={14} />
            Limpar
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        {[
          {
            icon: <TrendingUp size={16} color="#10b981" />,
            label: "Receitas",
            value: fmt(a.totalIncome),
            color: "#10b981",
          },
          {
            icon: <TrendingDown size={16} color="#ef4444" />,
            label: "Despesas",
            value: fmt(a.totalExpenses),
            color: "#ef4444",
          },
          {
            icon: <Sparkles size={16} color="#f59e0b" />,
            label: "Poupança",
            value: `${a.savingsRate}%`,
            color: a.savingsRate >= 20 ? "#10b981" : a.savingsRate >= 10 ? "#f59e0b" : "#ef4444",
          },
          {
            icon: <Target size={16} color="#8b5cf6" />,
            label: "Metas ativas",
            value: `${a.goalsProgress.length}`,
            color: "#8b5cf6",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "12px",
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            {stat.icon}
            <div>
              <div style={{ fontSize: "11px", color: "#64748b" }}>{stat.label}</div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: stat.color }}>{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Chat window */}
      <div
        style={{
          background: "#1e293b",
          border: "1px solid #334155",
          borderRadius: "16px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          height: "480px",
        }}
      >
        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: "flex",
                gap: "10px",
                flexDirection: msg.role === "user" ? "row-reverse" : "row",
                alignItems: "flex-start",
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background:
                    msg.role === "assistant"
                      ? "linear-gradient(135deg, #8b5cf6, #3b82f6)"
                      : "linear-gradient(135deg, #3b82f6, #10b981)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontSize: "14px",
                }}
              >
                {msg.role === "assistant" ? <Bot size={16} color="white" /> : "👤"}
              </div>

              {/* Bubble */}
              <div
                style={{
                  maxWidth: "75%",
                  background: msg.role === "user" ? "linear-gradient(135deg, #3b82f6, #2563eb)" : "#0f172a",
                  border: msg.role === "user" ? "none" : "1px solid #334155",
                  borderRadius: msg.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                  padding: "12px 16px",
                  fontSize: "14px",
                  lineHeight: 1.6,
                  color: msg.role === "user" ? "#fff" : "#cbd5e1",
                }}
              >
                {renderContent(msg.content)}
                <div
                  style={{
                    fontSize: "10px",
                    color: msg.role === "user" ? "rgba(255,255,255,0.5)" : "#475569",
                    marginTop: "6px",
                    textAlign: msg.role === "user" ? "right" : "left",
                  }}
                >
                  {msg.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Bot size={16} color="white" />
              </div>
              <div
                style={{
                  background: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "4px 16px 16px 16px",
                  padding: "14px 18px",
                  display: "flex",
                  gap: "4px",
                  alignItems: "center",
                }}
              >
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#64748b",
                      animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Quick suggestions */}
        <div
          style={{
            padding: "8px 16px",
            borderTop: "1px solid #1e293b",
            display: "flex",
            gap: "8px",
            overflowX: "auto",
            background: "#0f172a",
          }}
        >
          {quickSuggestions.map((s) => (
            <button
              key={s.msg}
              onClick={() => sendMessage(s.msg)}
              disabled={isTyping}
              style={{
                background: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "20px",
                padding: "6px 14px",
                fontSize: "12px",
                color: "#94a3b8",
                cursor: isTyping ? "not-allowed" : "pointer",
                whiteSpace: "nowrap",
                flexShrink: 0,
                opacity: isTyping ? 0.5 : 1,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!isTyping) {
                  (e.currentTarget as HTMLButtonElement).style.background = "#334155";
                  (e.currentTarget as HTMLButtonElement).style.color = "#f1f5f9";
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#1e293b";
                (e.currentTarget as HTMLButtonElement).style.color = "#94a3b8";
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: "12px 16px",
            borderTop: "1px solid #334155",
            display: "flex",
            gap: "10px",
            background: "#1e293b",
          }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte sobre suas finanças..."
            disabled={isTyping}
            style={{
              flex: 1,
              background: "#0f172a",
              border: "1px solid #334155",
              borderRadius: "10px",
              padding: "10px 14px",
              fontSize: "14px",
              color: "#f1f5f9",
              outline: "none",
            }}
            onFocus={(e) => {
              (e.currentTarget as HTMLInputElement).style.borderColor = "#3b82f6";
            }}
            onBlur={(e) => {
              (e.currentTarget as HTMLInputElement).style.borderColor = "#334155";
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            style={{
              background:
                !input.trim() || isTyping
                  ? "#334155"
                  : "linear-gradient(135deg, #3b82f6, #2563eb)",
              border: "none",
              borderRadius: "10px",
              padding: "10px 16px",
              cursor: !input.trim() || isTyping ? "not-allowed" : "pointer",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>

      {/* Tip banner */}
      <div
        style={{
          marginTop: "16px",
          background: "rgba(139,92,246,0.1)",
          border: "1px solid rgba(139,92,246,0.3)",
          borderRadius: "12px",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <Lightbulb size={16} color="#8b5cf6" style={{ flexShrink: 0 }} />
        <p style={{ fontSize: "13px", color: "#a78bfa", margin: 0 }}>
          <strong>Dica:</strong> Quanto mais transações você registrar, mais precisas serão as análises da IA. Mantenha seus lançamentos atualizados!
        </p>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
