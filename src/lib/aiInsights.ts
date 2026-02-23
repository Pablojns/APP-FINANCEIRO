import { AppData } from "./types";

export interface AIInsight {
  id: string;
  type: "warning" | "tip" | "success" | "info";
  title: string;
  message: string;
  action?: string;
  actionTab?: string;
}

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function generateInsights(data: AppData): AIInsight[] {
  const insights: AIInsight[] = [];

  const totalIncome = data.transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);

  const totalExpenses = data.transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

  // Expenses by category
  const byCategory: Record<string, number> = {};
  data.transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      byCategory[t.category] = (byCategory[t.category] ?? 0) + t.amount;
    });

  const categoryLabels: Record<string, string> = {
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

  const sortedCategories = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  const topCategory = sortedCategories[0];

  // ── Balance insights ──
  if (balance < 0) {
    insights.push({
      id: "negative-balance",
      type: "warning",
      title: "⚠️ Saldo negativo",
      message: `Você está gastando ${fmt(Math.abs(balance))} a mais do que ganha. Reduza despesas urgentemente.`,
      action: "Ver lançamentos",
      actionTab: "transactions",
    });
  } else if (savingsRate < 10 && totalIncome > 0) {
    insights.push({
      id: "low-savings",
      type: "warning",
      title: "💡 Taxa de poupança baixa",
      message: `Você está poupando apenas ${savingsRate.toFixed(0)}% da renda. O ideal é pelo menos 20%.`,
      action: "Ver relatórios",
      actionTab: "reports",
    });
  } else if (savingsRate >= 20) {
    insights.push({
      id: "good-savings",
      type: "success",
      title: "🎉 Ótima taxa de poupança!",
      message: `Você está poupando ${savingsRate.toFixed(0)}% da renda — acima da média. Continue assim!`,
    });
  }

  // ── Top spending category ──
  if (topCategory && totalExpenses > 0) {
    const pct = (topCategory[1] / totalExpenses) * 100;
    const label = categoryLabels[topCategory[0]] ?? topCategory[0];

    if (topCategory[0] === "entertainment" && pct > 20) {
      insights.push({
        id: "high-entertainment",
        type: "warning",
        title: "🎮 Entretenimento alto",
        message: `${label} representa ${pct.toFixed(0)}% dos seus gastos (${fmt(topCategory[1])}). Revise assinaturas e lazer.`,
        action: "Ver gastos",
        actionTab: "transactions",
      });
    } else if (topCategory[0] === "food" && pct > 35) {
      insights.push({
        id: "high-food",
        type: "tip",
        title: "🍳 Alimentação acima do ideal",
        message: `${label} está em ${pct.toFixed(0)}% dos gastos. Cozinhar em casa pode economizar até 60%.`,
        action: "Ver lançamentos",
        actionTab: "transactions",
      });
    } else if (topCategory[0] === "housing" && pct > 30) {
      insights.push({
        id: "high-housing",
        type: "warning",
        title: "🏠 Moradia acima de 30%",
        message: `Moradia representa ${pct.toFixed(0)}% dos seus gastos. Considere renegociar ou buscar alternativas.`,
      });
    } else if (pct > 40) {
      insights.push({
        id: "concentrated-spending",
        type: "tip",
        title: `📊 ${label} concentra seus gastos`,
        message: `${pct.toFixed(0)}% das despesas vão para ${label.toLowerCase()} (${fmt(topCategory[1])}). Diversifique o orçamento.`,
        action: "Ver relatórios",
        actionTab: "reports",
      });
    }
  }

  // ── Goals insights ──
  if (data.goals.length === 0 && totalIncome > 0) {
    insights.push({
      id: "no-goals",
      type: "info",
      title: "🎯 Sem metas definidas",
      message: "Defina metas financeiras para ter mais foco e motivação. Pessoas com metas poupam 42% mais.",
      action: "Criar meta",
      actionTab: "goals",
    });
  } else {
    const slowGoals = data.goals.filter(
      (g) => g.currentAmount / g.targetAmount < 0.3
    );
    if (slowGoals.length > 0) {
      insights.push({
        id: "slow-goals",
        type: "tip",
        title: "🎯 Metas com progresso baixo",
        message: `${slowGoals.length} meta(s) com menos de 30% de progresso. Aumente as contribuições mensais.`,
        action: "Ver metas",
        actionTab: "goals",
      });
    }

    const nearGoals = data.goals.filter(
      (g) => g.currentAmount / g.targetAmount >= 0.8
    );
    if (nearGoals.length > 0) {
      insights.push({
        id: "near-goals",
        type: "success",
        title: "🏆 Quase lá!",
        message: `${nearGoals.length} meta(s) com mais de 80% concluída(s). Você está quase lá!`,
        action: "Ver metas",
        actionTab: "goals",
      });
    }
  }

  // ── Card insights ──
  const cardTotal = data.cardExpenses.reduce((s, e) => s + e.amount, 0);
  if (cardTotal > 0 && totalIncome > 0) {
    const cardPct = (cardTotal / totalIncome) * 100;
    if (cardPct > 50) {
      insights.push({
        id: "high-card-usage",
        type: "warning",
        title: "💳 Uso alto do cartão",
        message: `${cardPct.toFixed(0)}% da sua renda está comprometida com cartão (${fmt(cardTotal)}). Cuidado com o rotativo!`,
        action: "Ver cartões",
        actionTab: "cards",
      });
    }
  }

  // ── Emergency fund tip ──
  if (totalExpenses > 0 && data.goals.length < 2) {
    const emergencyTarget = totalExpenses * 4;
    insights.push({
      id: "emergency-fund",
      type: "info",
      title: "🛡️ Reserva de emergência",
      message: `Sua reserva ideal é ${fmt(emergencyTarget)} (4 meses de despesas). Crie uma meta para isso!`,
      action: "Criar meta",
      actionTab: "goals",
    });
  }

  // ── Investment tip ──
  if (savingsRate >= 20 && totalIncome > 0) {
    insights.push({
      id: "invest-tip",
      type: "tip",
      title: "📈 Hora de investir!",
      message: `Com ${savingsRate.toFixed(0)}% de poupança, você tem margem para investir. Comece pelo Tesouro Selic.`,
      action: "Falar com IA",
      actionTab: "ai",
    });
  }

  // Return max 4 most relevant insights
  return insights.slice(0, 4);
}

export function getTransactionInsights(data: AppData): AIInsight[] {
  const insights: AIInsight[] = [];

  const expenses = data.transactions.filter((t) => t.type === "expense");
  const income = data.transactions.filter((t) => t.type === "income");

  if (expenses.length === 0) {
    insights.push({
      id: "no-expenses",
      type: "info",
      title: "📝 Nenhuma despesa registrada",
      message: "Registre seus gastos para obter análises personalizadas da IA.",
    });
    return insights;
  }

  // Recent spending trend (last 5 expenses)
  const recentExpenses = expenses.slice(-5);
  const recentTotal = recentExpenses.reduce((s, t) => s + t.amount, 0);
  const avgExpense = recentTotal / recentExpenses.length;

  if (avgExpense > 500) {
    insights.push({
      id: "high-avg-expense",
      type: "warning",
      title: "📊 Gastos recentes elevados",
      message: `Média dos últimos lançamentos: ${fmt(avgExpense)}. Fique atento ao orçamento mensal.`,
    });
  }

  // Income vs expense ratio
  const totalIncome = income.reduce((s, t) => s + t.amount, 0);
  const totalExpenses = expenses.reduce((s, t) => s + t.amount, 0);

  if (totalIncome > 0 && totalExpenses / totalIncome > 0.9) {
    insights.push({
      id: "expense-ratio",
      type: "warning",
      title: "⚠️ Despesas próximas da renda",
      message: `Suas despesas representam ${((totalExpenses / totalIncome) * 100).toFixed(0)}% da renda. Margem muito pequena!`,
    });
  }

  // Category diversity
  const categories = new Set(expenses.map((t) => t.category));
  if (categories.size >= 5) {
    insights.push({
      id: "diverse-spending",
      type: "info",
      title: "📂 Gastos diversificados",
      message: `Você tem despesas em ${categories.size} categorias. Use os relatórios para ver onde cortar.`,
      action: "Ver relatórios",
      actionTab: "reports",
    });
  }

  return insights.slice(0, 3);
}

export function getGoalInsights(data: AppData): AIInsight[] {
  const insights: AIInsight[] = [];

  if (data.goals.length === 0) {
    insights.push({
      id: "create-goals",
      type: "info",
      title: "🎯 Crie suas primeiras metas",
      message: "Metas financeiras aumentam em 42% a chance de você poupar. Comece com uma reserva de emergência!",
    });
    return insights;
  }

  const totalIncome = data.transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);

  const totalMonthlyTarget = data.goals.reduce((s, g) => s + g.monthlyTarget, 0);

  if (totalIncome > 0 && totalMonthlyTarget / totalIncome > 0.4) {
    insights.push({
      id: "high-monthly-target",
      type: "warning",
      title: "💰 Metas mensais muito altas",
      message: `Suas metas exigem ${fmt(totalMonthlyTarget)}/mês — ${((totalMonthlyTarget / totalIncome) * 100).toFixed(0)}% da renda. Revise os prazos.`,
    });
  }

  const completedGoals = data.goals.filter(
    (g) => g.currentAmount >= g.targetAmount
  );
  if (completedGoals.length > 0) {
    insights.push({
      id: "completed-goals",
      type: "success",
      title: "🏆 Meta(s) concluída(s)!",
      message: `Parabéns! Você concluiu ${completedGoals.length} meta(s). Defina novos objetivos para continuar crescendo.`,
    });
  }

  // Check for overdue goals
  const now = new Date();
  const overdueGoals = data.goals.filter((g) => {
    const deadline = new Date(g.deadline);
    return deadline < now && g.currentAmount < g.targetAmount;
  });

  if (overdueGoals.length > 0) {
    insights.push({
      id: "overdue-goals",
      type: "warning",
      title: "⏰ Metas com prazo vencido",
      message: `${overdueGoals.length} meta(s) passaram do prazo. Revise os objetivos e atualize as datas.`,
    });
  }

  return insights.slice(0, 3);
}
