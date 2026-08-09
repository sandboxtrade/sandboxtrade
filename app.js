// app-src.jsx
import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { TrendingUp, Building2, X, Sparkles, RotateCcw, Briefcase, FlaskConical, Flame, CreditCard, MessageCircle, ShieldAlert, Heart, MessageSquare, RefreshCw, ArrowRightLeft, Landmark, ShoppingBag, Wallet, Receipt, Send, Save, Plus, Check, EyeOff } from "lucide-react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
var C = {
  bg: "#0B0E14",
  surface: "#12161F",
  surface2: "#1A2029",
  border: "#232A36",
  gold: "#E8B14C",
  green: "#3FD68C",
  red: "#FF5C5C",
  ink: "#E7EAEE",
  inkDim: "#7A8494",
  inkFaint: "#4A5261"
};
var SECTORS = ["\u0422\u0435\u0445\u043D\u043E\u043B\u043E\u0433\u0438\u0438", "\u042D\u043D\u0435\u0440\u0433\u0435\u0442\u0438\u043A\u0430", "\u0411\u0438\u043E\u0442\u0435\u0445", "\u041A\u0440\u0438\u043F\u0442\u043E", "\u041F\u043E\u0442\u0440\u0435\u0431\u0442\u043E\u0432\u0430\u0440\u044B", "\u0424\u0438\u043D\u0430\u043D\u0441\u044B"];
var NPC_SEED = [
  { name: "\u0413\u0435\u043B\u0438\u043E\u0441 \u0411\u0438\u043E\u0441\u0438\u0441\u0442\u0435\u043C\u0441", ticker: "HLXB", sector: "\u0411\u0438\u043E\u0442\u0435\u0445", price: 42, vol: 0.55, supply: 2e6 },
  { name: "\u041D\u0438\u043C\u0431\u0443\u0441 \u041A\u043B\u0430\u0443\u0434", ticker: "NMBS", sector: "\u0422\u0435\u0445\u043D\u043E\u043B\u043E\u0433\u0438\u0438", price: 130, vol: 0.45, supply: 9e5 },
  { name: "\u041B\u0435\u0434\u0436\u0435\u0440 \u041F\u0440\u043E\u0442\u043E\u043A\u043E\u043B", ticker: "LEDG", sector: "\u041A\u0440\u0438\u043F\u0442\u043E", price: 3.2, vol: 1.35, supply: 4e7 },
  { name: "\u041E\u043F\u0430\u043B \u0427\u0435\u0439\u043D", ticker: "OPAL", sector: "\u041A\u0440\u0438\u043F\u0442\u043E", price: 0.85, vol: 1.6, supply: 12e7 },
  { name: "\u0422\u0435\u0442\u0435\u0440 \u041A\u043E\u043C\u043F\u0430\u043D\u0438", ticker: "TEHER", sector: "\u041A\u0440\u0438\u043F\u0442\u043E", price: 1, vol: 0.03, supply: 8e7 },
  { name: "\u0410\u0442\u043B\u0430\u0441 \u0424\u0438\u043D\u0430\u043D\u0441", ticker: "ATLF", sector: "\u0424\u0438\u043D\u0430\u043D\u0441\u044B", price: 88, vol: 0.4, supply: 15e5 },
  // Банки и поставщики — тоже торгуются на бирже, их состояние влияет на условия кредитов и закупок
  { name: "\u0411\u044B\u0441\u0442\u0440\u043E\u0414\u0435\u043D\u044C\u0433\u0438", ticker: "MFOX", sector: "\u0424\u0438\u043D\u0430\u043D\u0441\u044B", price: 6, vol: 0.25, supply: 8e6 },
  { name: "\u0427\u0430\u0441\u0442\u0411\u0430\u043D\u043A", ticker: "PRIV", sector: "\u0424\u0438\u043D\u0430\u043D\u0441\u044B", price: 45, vol: 0.18, supply: 2e6 },
  { name: "\u0424\u0435\u0434\u0411\u0430\u043D\u043A", ticker: "FEDB", sector: "\u0424\u0438\u043D\u0430\u043D\u0441\u044B", price: 210, vol: 0.12, supply: 6e5 },
  { name: "\u0411\u0438\u0437\u043D\u0435\u0441\u041A\u0440\u0435\u0434\u0438\u0442", ticker: "BZKR", sector: "\u0424\u0438\u043D\u0430\u043D\u0441\u044B", price: 30, vol: 0.2, supply: 18e5 },
  { name: "\u0413\u0443\u0430\u043D\u0447\u0436\u043E\u0443 \u0422\u0440\u0435\u0439\u0434", ticker: "GZTC", sector: "\u041F\u043E\u0442\u0440\u0435\u0431\u0442\u043E\u0432\u0430\u0440\u044B", price: 14, vol: 1.2, supply: 5e6 },
  { name: "\u0421\u0442\u0430\u043C\u0431\u0443\u043B \u0422\u0435\u043A\u0441\u0442\u0438\u043B\u044C", ticker: "ISTX", sector: "\u041F\u043E\u0442\u0440\u0435\u0431\u0442\u043E\u0432\u0430\u0440\u044B", price: 22, vol: 0.9, supply: 25e5 },
  { name: "\u0414\u043E\u0439\u0447\u0435 \u0412\u0430\u0440\u0435\u043D\u0445\u0430\u043D\u0434\u0435\u043B\u044C", ticker: "DWHX", sector: "\u041F\u043E\u0442\u0440\u0435\u0431\u0442\u043E\u0432\u0430\u0440\u044B", price: 95, vol: 0.45, supply: 7e5 },
  { name: "\u041B\u043E\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u0421\u043A\u043B\u0430\u0434", ticker: "LOKS", sector: "\u041F\u043E\u0442\u0440\u0435\u0431\u0442\u043E\u0432\u0430\u0440\u044B", price: 9, vol: 0.5, supply: 3e6 },
  { name: "\u0421\u0435\u0432\u0435\u0440\u0420\u0435\u0437\u0435\u0440\u0432", ticker: "SVRB", sector: "\u0424\u0438\u043D\u0430\u043D\u0441\u044B", price: 38, vol: 0.15, supply: 16e5 },
  { name: "\u041D\u0435\u043E\u0411\u0430\u043D\u043A", ticker: "NEOB", sector: "\u0424\u0438\u043D\u0430\u043D\u0441\u044B", price: 17, vol: 0.22, supply: 42e5 }
];
var NEWS = {
  pos: [
    "{t} \u043E\u0442\u0447\u0438\u0442\u0430\u043B\u0441\u044F \u043B\u0443\u0447\u0448\u0435 \u043F\u0440\u043E\u0433\u043D\u043E\u0437\u043E\u0432",
    "{t} \u043E\u0431\u044A\u044F\u0432\u0438\u043B \u043E \u043A\u0440\u0443\u043F\u043D\u043E\u043C \u043F\u0430\u0440\u0442\u043D\u0451\u0440\u0441\u0442\u0432\u0435",
    "\u0410\u043D\u0430\u043B\u0438\u0442\u0438\u043A\u0438 \u043F\u043E\u0432\u044B\u0441\u0438\u043B\u0438 \u0440\u0435\u0439\u0442\u0438\u043D\u0433 {t}",
    "{t} \u0432\u044B\u043F\u0443\u0441\u0442\u0438\u043B \u043D\u043E\u0432\u044B\u0439 \u043F\u0440\u043E\u0434\u0443\u043A\u0442",
    "\u041A\u0440\u0443\u043F\u043D\u044B\u0435 \u0438\u043D\u0432\u0435\u0441\u0442\u043E\u0440\u044B \u0441\u043A\u0443\u043F\u0430\u044E\u0442 {t}",
    "{t} \u043F\u043E\u043B\u0443\u0447\u0438\u043B \u043A\u0440\u0443\u043F\u043D\u044B\u0439 \u043A\u043E\u043D\u0442\u0440\u0430\u043A\u0442"
  ],
  neg: [
    "{t} \u043D\u0435 \u043E\u043F\u0440\u0430\u0432\u0434\u0430\u043B \u043F\u0440\u043E\u0433\u043D\u043E\u0437\u044B",
    "{t} \u043F\u043E\u043F\u0430\u043B \u043F\u043E\u0434 \u0440\u0430\u0441\u0441\u043B\u0435\u0434\u043E\u0432\u0430\u043D\u0438\u0435 \u0440\u0435\u0433\u0443\u043B\u044F\u0442\u043E\u0440\u0430",
    "\u0410\u043D\u0430\u043B\u0438\u0442\u0438\u043A\u0438 \u043F\u043E\u043D\u0438\u0437\u0438\u043B\u0438 \u0440\u0435\u0439\u0442\u0438\u043D\u0433 {t}",
    "\u041F\u0440\u043E\u0431\u043B\u0435\u043C\u044B \u0441 \u043F\u043E\u0441\u0442\u0430\u0432\u043A\u0430\u043C\u0438 \u0443\u0434\u0430\u0440\u0438\u043B\u0438 \u043F\u043E {t}",
    "\u0418\u043D\u0441\u0430\u0439\u0434\u0435\u0440\u044B \u043F\u0440\u043E\u0434\u0430\u044E\u0442 \u0430\u043A\u0446\u0438\u0438 {t}",
    "{t} \u043F\u043E\u0442\u0435\u0440\u044F\u043B \u043A\u0440\u0443\u043F\u043D\u043E\u0433\u043E \u043A\u043B\u0438\u0435\u043D\u0442\u0430"
  ]
};
var MACRO_NEWS = {
  crash: [
    "\u0426\u0435\u043D\u0442\u0440\u043E\u0431\u0430\u043D\u043A \u043E\u0431\u044A\u044F\u0432\u0438\u043B \u0434\u0435\u0444\u043E\u043B\u0442 \u043F\u043E \u0433\u043E\u0441\u043E\u0431\u043B\u0438\u0433\u0430\u0446\u0438\u044F\u043C",
    "\u041C\u0438\u0440\u043E\u0432\u043E\u0439 \u0444\u0438\u043D\u0430\u043D\u0441\u043E\u0432\u044B\u0439 \u043A\u0440\u0438\u0437\u0438\u0441 \u0443\u0434\u0430\u0440\u0438\u043B \u043F\u043E \u0432\u0441\u0435\u043C \u0440\u044B\u043D\u043A\u0430\u043C",
    "\u041A\u0440\u0443\u043F\u043D\u0435\u0439\u0448\u0430\u044F \u0431\u0438\u0440\u0436\u0430 \u043F\u0440\u0438\u043E\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u043B\u0430 \u0442\u043E\u0440\u0433\u0438 \u0438\u0437-\u0437\u0430 \u043A\u0438\u0431\u0435\u0440\u0430\u0442\u0430\u043A\u0438",
    "\u0420\u0435\u0433\u0443\u043B\u044F\u0442\u043E\u0440 \u0440\u0435\u0437\u043A\u043E \u0443\u0436\u0435\u0441\u0442\u043E\u0447\u0438\u043B \u043F\u0440\u0430\u0432\u0438\u043B\u0430 \u0442\u043E\u0440\u0433\u043E\u0432"
  ],
  rally: [
    "\u0426\u0435\u043D\u0442\u0440\u043E\u0431\u0430\u043D\u043A \u0441\u043D\u0438\u0437\u0438\u043B \u043A\u043B\u044E\u0447\u0435\u0432\u0443\u044E \u0441\u0442\u0430\u0432\u043A\u0443",
    "\u0420\u0435\u0433\u0443\u043B\u044F\u0442\u043E\u0440 \u043F\u0440\u0438\u0437\u043D\u0430\u043B \u043A\u0440\u0438\u043F\u0442\u0443 \u0437\u0430\u043A\u043E\u043D\u043D\u044B\u043C \u043F\u043B\u0430\u0442\u0451\u0436\u043D\u044B\u043C \u0441\u0440\u0435\u0434\u0441\u0442\u0432\u043E\u043C",
    "\u041A\u0440\u0443\u043F\u043D\u044B\u0439 \u0433\u043E\u0441\u0443\u0434\u0430\u0440\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0439 \u0444\u043E\u043D\u0434 \u0437\u0430\u0448\u0451\u043B \u043D\u0430 \u0440\u044B\u043D\u043E\u043A"
  ]
};
var MACRO_ACCOUNT = { handle: "@\u0424\u0438\u043D\u0412\u0435\u0441\u0442\u043D\u0438\u043A", name: "\u0424\u0438\u043D\u0430\u043D\u0441\u043E\u0432\u044B\u0439 \u0412\u0435\u0441\u0442\u043D\u0438\u043A", color: "#E8B14C", verified: true };
var SOCIAL_ACCOUNTS = [
  { handle: "@MaxTrader", name: "\u041C\u0430\u043A\u0441 \u0422\u0440\u0435\u0439\u0434\u0435\u0440", color: "#3FD68C" },
  { handle: "@CryptoAnalytics", name: "\u041A\u0440\u0438\u043F\u0442\u043E\u0410\u043D\u0430\u043B\u0438\u0442\u0438\u043A\u0430", color: "#5AA9E6" },
  { handle: "@WallInsider", name: "\u0423\u043E\u043B\u043B-\u0421\u0442\u0440\u0438\u0442 \u0418\u043D\u0441\u0430\u0439\u0434\u0435\u0440", color: "#7A8494" },
  { handle: "@MarketWatcher", name: "\u041D\u0430\u0431\u043B\u044E\u0434\u0430\u0442\u0435\u043B\u044C \u0420\u044B\u043D\u043A\u0430", color: "#FF5C5C" },
  { handle: "@FinanceDaily", name: "\u0424\u0438\u043D\u0430\u043D\u0441\u044B \u0414\u043D\u044F", color: "#3FD68C" },
  { handle: "@DegenTrader", name: "\u0414\u0435\u0433\u0435\u043D\u0435\u0440\u0430\u0442 \u0422\u0440\u0435\u0439\u0434\u0435\u0440", color: "#E8B14C" }
];
function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = h * 31 + s.charCodeAt(i) >>> 0;
  return h;
}
function authorFor(post) {
  if (post.isMacro) return MACRO_ACCOUNT;
  return SOCIAL_ACCOUNTS[hashStr(post.id) % SOCIAL_ACCOUNTS.length];
}
function engagementFor(post) {
  const h = hashStr(post.id + "e");
  const base = post.isMacro ? 900 : 35;
  const likes = base + h % (post.isMacro ? 5e3 : 260);
  return { likes, reposts: Math.round(likes * 0.16) };
}
var POSITIONS = [
  { id: "intern", name: "\u0421\u0442\u0430\u0436\u0451\u0440", salary: 40, cooldown: 40, minShifts: 0 },
  { id: "specialist", name: "\u0421\u043F\u0435\u0446\u0438\u0430\u043B\u0438\u0441\u0442", salary: 90, cooldown: 60, minShifts: 5 },
  { id: "manager", name: "\u041C\u0435\u043D\u0435\u0434\u0436\u0435\u0440", salary: 200, cooldown: 80, minShifts: 15 }
];
var EMPLOYER_TICKERS = ["HLXB", "NMBS", "ATLF"];
var TASK_OPTIONS = [
  { id: "normal", name: "\u041E\u0431\u044B\u0447\u043D\u0430\u044F \u0437\u0430\u0434\u0430\u0447\u0430", icon: "\u{1F4CB}", payMult: 1, cooldownMult: 1, risky: false, desc: "\u0421\u0442\u0430\u0431\u0438\u043B\u044C\u043D\u043E, \u0431\u0435\u0437 \u0441\u044E\u0440\u043F\u0440\u0438\u0437\u043E\u0432." },
  { id: "overtime", name: "\u041F\u0435\u0440\u0435\u0440\u0430\u0431\u043E\u0442\u043A\u0430", icon: "\u{1F319}", payMult: 1.6, cooldownMult: 1.8, risky: false, desc: "\u041F\u043B\u0430\u0442\u044F\u0442 \u0431\u043E\u043B\u044C\u0448\u0435, \u043D\u043E \u0434\u043E\u043B\u044C\u0448\u0435 \u043E\u0442\u0434\u044B\u0445\u0430\u0442\u044C \u043F\u043E\u0442\u043E\u043C." },
  { id: "rush", name: "\u0421\u0440\u043E\u0447\u043D\u044B\u0439 \u043F\u0440\u043E\u0435\u043A\u0442", icon: "\u{1F3B2}", payMult: 1, cooldownMult: 1, risky: true, desc: "50/50: \u043B\u0438\u0431\u043E \u0431\u043E\u043D\u0443\u0441 \xD72.2, \u043B\u0438\u0431\u043E \u0432\u0441\u0435\u0433\u043E 40% \u043E\u043A\u043B\u0430\u0434\u0430." }
];
var BANKS = [
  { id: "mfo", name: "\u0411\u044B\u0441\u0442\u0440\u043E\u0414\u0435\u043D\u044C\u0433\u0438", type: "\u041C\u0424\u041E", ticker: "MFOX", baseMax: 400, cashMult: 0.5, assetMult: 0.08, ratePerTick: 7e-3, minNetWorth: 0, requiresExperience: false, desc: "\u041E\u0434\u043E\u0431\u0440\u044F\u044E\u0442 \u043F\u043E\u0447\u0442\u0438 \u0432\u0441\u0435\u043C, \u043D\u043E \u0441\u0442\u0430\u0432\u043A\u0430 \u0433\u0440\u0430\u0431\u0438\u0442\u0435\u043B\u044C\u0441\u043A\u0430\u044F \u2014 \u0434\u043E\u043B\u0433 \u0440\u0430\u0441\u0442\u0451\u0442 \u0431\u044B\u0441\u0442\u0440\u0435\u0435 \u043E\u0441\u0442\u0430\u043B\u044C\u043D\u044B\u0445. \u041B\u0438\u043C\u0438\u0442 \u0440\u0430\u0441\u0442\u0451\u0442 \u0432\u043C\u0435\u0441\u0442\u0435 \u0441 \u0442\u0432\u043E\u0438\u043C \u0431\u0430\u043B\u0430\u043D\u0441\u043E\u043C." },
  { id: "priv", name: "\u0427\u0430\u0441\u0442\u0411\u0430\u043D\u043A", type: "\u0427\u0430\u0441\u0442\u043D\u044B\u0439 \u0431\u0430\u043D\u043A", ticker: "PRIV", baseMax: 1200, cashMult: 0.8, assetMult: 0.3, ratePerTick: 25e-4, minNetWorth: 800, requiresExperience: false, desc: "\u0421\u0442\u0430\u0432\u043A\u0430 \u0443\u043C\u0435\u0440\u0435\u043D\u043D\u0435\u0435, \u043B\u0438\u043C\u0438\u0442 \u0437\u0430\u0432\u0438\u0441\u0438\u0442 \u043E\u0442 \u0431\u0430\u043B\u0430\u043D\u0441\u0430 \u0438 \u0430\u043A\u0442\u0438\u0432\u043E\u0432. \u041D\u0443\u0436\u0435\u043D \u043C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u044B\u0439 \u043A\u0430\u043F\u0438\u0442\u0430\u043B." },
  { id: "fed", name: "\u0424\u0435\u0434\u0411\u0430\u043D\u043A", type: "\u0424\u0435\u0434\u0435\u0440\u0430\u043B\u044C\u043D\u044B\u0439 \u0431\u0430\u043D\u043A", ticker: "FEDB", baseMax: 3e3, cashMult: 1.1, assetMult: 0.7, ratePerTick: 1e-3, minNetWorth: 4e3, requiresExperience: true, desc: "\u041D\u0438\u0437\u043A\u0430\u044F \u0441\u0442\u0430\u0432\u043A\u0430 \u0438 \u0441\u0430\u043C\u044B\u0439 \u0432\u044B\u0441\u043E\u043A\u0438\u0439 \u043F\u043E\u0442\u043E\u043B\u043E\u043A \u2014 \u043D\u043E \u043D\u0443\u0436\u043D\u044B \u043A\u0430\u043F\u0438\u0442\u0430\u043B \u0438 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043D\u043D\u044B\u0439 \u043E\u043F\u044B\u0442 \u0440\u0430\u0431\u043E\u0442\u044B." },
  { id: "svrb", name: "\u0421\u0435\u0432\u0435\u0440\u0420\u0435\u0437\u0435\u0440\u0432", type: "\u0421\u0431\u0435\u0440\u0435\u0433\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u0431\u0430\u043D\u043A", ticker: "SVRB", baseMax: 1800, cashMult: 0.9, assetMult: 0.4, ratePerTick: 18e-4, minNetWorth: 1200, requiresExperience: false, desc: "\u0423\u0441\u0442\u043E\u0439\u0447\u0438\u0432\u044B\u0439 \u0431\u0430\u043D\u043A \u0441 \u0440\u0435\u0437\u0435\u0440\u0432\u0430\u043C\u0438 \u2014 \u0443\u0441\u043B\u043E\u0432\u0438\u044F \u0441\u0435\u0440\u0435\u0434\u043D\u044F\u0447\u043A\u0430, \u0437\u0430\u0442\u043E \u0440\u0435\u0434\u043A\u043E \u043E\u0442\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442 \u0441\u0432\u043E\u0438\u043C \u0432\u043A\u043B\u0430\u0434\u0447\u0438\u043A\u0430\u043C." },
  { id: "neob", name: "\u041D\u0435\u043E\u0411\u0430\u043D\u043A", type: "\u0426\u0438\u0444\u0440\u043E\u0432\u043E\u0439 \u0431\u0430\u043D\u043A", ticker: "NEOB", baseMax: 2500, cashMult: 0.7, assetMult: 0.5, ratePerTick: 15e-4, minNetWorth: 0, requiresExperience: false, desc: "\u041E\u0434\u043E\u0431\u0440\u044F\u0435\u0442 \u0431\u044B\u0441\u0442\u0440\u043E \u0438 \u043F\u043E\u0447\u0442\u0438 \u0432\u0441\u0435\u043C \u2014 \u0440\u0435\u0448\u0435\u043D\u0438\u0435 \u043F\u043E \u0437\u0430\u044F\u0432\u043A\u0435 \u0437\u0430 \u0441\u0435\u043A\u0443\u043D\u0434\u044B, \u0441\u0442\u0430\u0432\u043A\u0430 \u043D\u0438\u0436\u0435 \u0441\u0440\u0435\u0434\u043D\u0435\u0433\u043E." }
];
function bankRatingLimitMult(rating) {
  return 0.5 + rating / 100 * 1;
}
function bankRatingRateMult(rating) {
  return 1.8 - rating / 100 * 1.2;
}
function companyPerfPct(companies, ticker) {
  const c = companies && companies.find((x) => x.ticker === ticker);
  if (!c || !c.candles || !c.candles[0]) return 0;
  const open = c.candles[0].o || c.price;
  if (!open) return 0;
  const pct = (c.price - open) / open * 100;
  return Math.max(-60, Math.min(60, pct));
}
function bankHealthRateMult(perfPct) {
  return 1 - perfPct / 200;
}
function bankHealthLimitMult(perfPct) {
  return Math.max(0.5, 1 + perfPct / 150);
}
function bankAccountLimits(bank, acct) {
  const growthMult = 1 + Math.min(1.5, (acct && acct.lifetimeTurnover || 0) / 15e3);
  return { singleLimit: Math.round(bank.singleLimit * growthMult), turnoverCap: Math.round(bank.turnoverCap * growthMult) };
}
function supplierHealthPriceMult(perfPct) {
  return 1 + perfPct / 300;
}
function bankLimit(bank, cash, netWorth, repFactor = 1, clientRating = 50, healthPct = 0, turnoverGrowthMult = 1) {
  const base = Math.max(bank.baseMax * repFactor, Math.round((bank.baseMax + cash * bank.cashMult + netWorth * bank.assetMult) * repFactor));
  return Math.round(base * bankRatingLimitMult(clientRating) * bankHealthLimitMult(healthPct) * turnoverGrowthMult);
}
var BANK_ACCOUNTS = [
  { id: "mfo", name: "\u0411\u044B\u0441\u0442\u0440\u043E\u0414\u0435\u043D\u044C\u0433\u0438", ticker: "MFOX", cardName: "MFO Instant", openingFee: 0, singleLimit: 1500, overLimitFee: 0.08, turnoverCap: 12e3, savingsRate: 5e-3, savingsIntervalMs: 10 * 60 * 1e3, bond: { name: "\u0417\u0430\u0439\u043C\u044B \u041C\u0424\u041E", totalReturnPct: 35, termSeconds: 240, risk: 0.3, desc: "\u041E\u0433\u0440\u043E\u043C\u043D\u0430\u044F \u0434\u043E\u0445\u043E\u0434\u043D\u043E\u0441\u0442\u044C \u0438 \u0431\u043E\u043B\u044C\u0448\u043E\u0439 \u0440\u0438\u0441\u043A \u043D\u0435 \u043F\u043E\u043B\u0443\u0447\u0438\u0442\u044C \u043F\u043E\u0447\u0442\u0438 \u043D\u0438\u0447\u0435\u0433\u043E." } },
  { id: "priv", name: "\u0427\u0430\u0441\u0442\u0411\u0430\u043D\u043A", ticker: "PRIV", cardName: "Priv Black", openingFee: 50, singleLimit: 5e3, overLimitFee: 0.05, turnoverCap: 4e4, savingsRate: 8e-3, savingsIntervalMs: 10 * 60 * 1e3, bond: { name: "\u041A\u043E\u0440\u043F\u043E\u0440\u0430\u0442\u0438\u0432\u043D\u044B\u0435 \u043E\u0431\u043B\u0438\u0433\u0430\u0446\u0438\u0438", totalReturnPct: 18, termSeconds: 420, risk: 0.1, desc: "\u0412\u044B\u0448\u0435 \u0434\u043E\u0445\u043E\u0434\u043D\u043E\u0441\u0442\u044C, \u043D\u043E \u0435\u0441\u0442\u044C \u0448\u0430\u043D\u0441, \u0447\u0442\u043E \u044D\u043C\u0438\u0442\u0435\u043D\u0442 \u043D\u0435 \u0440\u0430\u0441\u043F\u043B\u0430\u0442\u0438\u0442\u0441\u044F." } },
  { id: "fed", name: "\u0424\u0435\u0434\u0411\u0430\u043D\u043A", ticker: "FEDB", cardName: "Fed Premium", openingFee: 150, singleLimit: 12e3, overLimitFee: 0.03, turnoverCap: 9e4, savingsRate: 0.012, savingsIntervalMs: 10 * 60 * 1e3, bond: { name: "\u0413\u043E\u0441\u043E\u0431\u043B\u0438\u0433\u0430\u0446\u0438\u0438", totalReturnPct: 7, termSeconds: 300, risk: 0, desc: "\u041D\u0430\u0434\u0451\u0436\u043D\u043E, \u0434\u043E\u0445\u043E\u0434 \u043D\u0435\u0432\u0435\u043B\u0438\u043A, \u043D\u043E \u0433\u0430\u0440\u0430\u043D\u0442\u0438\u0440\u043E\u0432\u0430\u043D \u0433\u043E\u0441\u0443\u0434\u0430\u0440\u0441\u0442\u0432\u043E\u043C." } },
  { id: "svrb", name: "\u0421\u0435\u0432\u0435\u0440\u0420\u0435\u0437\u0435\u0440\u0432", ticker: "SVRB", cardName: "Reserve Save", openingFee: 40, singleLimit: 3500, overLimitFee: 0.06, turnoverCap: 22e3, savingsRate: 0.018, savingsIntervalMs: 10 * 60 * 1e3, bond: { name: "\u0420\u0435\u0437\u0435\u0440\u0432\u043D\u044B\u0435 \u043E\u0431\u043B\u0438\u0433\u0430\u0446\u0438\u0438", totalReturnPct: 12, termSeconds: 360, risk: 0.05, desc: "\u0423\u0441\u0442\u043E\u0439\u0447\u0438\u0432\u044B\u0439 \u044D\u043C\u0438\u0442\u0435\u043D\u0442, \u0440\u0438\u0441\u043A \u0434\u0435\u0444\u043E\u043B\u0442\u0430 \u043C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u044B\u0439." } },
  { id: "neob", name: "\u041D\u0435\u043E\u0411\u0430\u043D\u043A", ticker: "NEOB", cardName: "Neo Digital", openingFee: 20, singleLimit: 7e3, overLimitFee: 0.045, turnoverCap: 55e3, savingsRate: 0.01, savingsIntervalMs: 10 * 60 * 1e3, bond: { name: "\u0426\u0438\u0444\u0440\u043E\u0432\u044B\u0435 \u043E\u0431\u043B\u0438\u0433\u0430\u0446\u0438\u0438", totalReturnPct: 22, termSeconds: 300, risk: 0.15, desc: "\u0411\u044B\u0441\u0442\u0440\u044B\u0439 \u0446\u0438\u0444\u0440\u043E\u0432\u043E\u0439 \u0432\u044B\u043F\u0443\u0441\u043A, \u0434\u043E\u0445\u043E\u0434\u043D\u043E\u0441\u0442\u044C \u0432\u044B\u0448\u0435 \u0441\u0440\u0435\u0434\u043D\u0435\u0433\u043E." } }
];
var TURNOVER_RESET_MS = 4 * 60 * 60 * 1e3;
var FREEZE_DURATION_MS = 4 * 60 * 1e3;
var GREY_BANK = {
  id: "grey",
  name: "Meridian Offshore",
  cardName: "Meridian Black",
  openingFee: 300,
  transferDelayMs: 2 * 60 * 1e3,
  tradeBuyFee: 0.1,
  tradeSellFee: 0.08,
  transferFee: 0.05,
  savingsRate: 0.05,
  savingsIntervalMs: 10 * 60 * 1e3,
  detectionThreshold: 12e3,
  freezeDurationMs: 10 * 60 * 1e3
};
function blackMarketCutRate(amount) {
  if (amount <= 1e3) return 0.2;
  if (amount <= 5e3) return 0.16;
  if (amount <= 1e4) return 0.12;
  return 0.1;
}
var BLACKMARKET_JOB_COUNT = 5;
var TEHER_TICKER = "TEHER";
var TEHER_TRANSFER_FEE = 0.01;
var IP_TURNOVER_CAP = 1e5;
var IP_WEALTH_TAX_RATE = 0.07;
var BLACKMARKET_HEAT_THRESHOLD = 25;
var BLACKMARKET_FREEZE_MS = 8 * 60 * 1e3;
var MULE_WARMUP_TARGET = 60;
var MULE_WARMUP_SMALL_TX_GAIN = 8;
var MULE_THEFT_CHECK_MS = 9e4;
var MULE_THEFT_CHANCE = 0.03;
var SHOP_ITEMS = [
  { id: "car1", category: "\u0422\u0440\u0430\u043D\u0441\u043F\u043E\u0440\u0442", name: "\u041F\u043E\u0434\u0435\u0440\u0436\u0430\u043D\u043D\u044B\u0439 \u0441\u0435\u0434\u0430\u043D", price: 3e3, icon: "\u{1F697}" },
  { id: "car2", category: "\u0422\u0440\u0430\u043D\u0441\u043F\u043E\u0440\u0442", name: "\u0421\u043F\u043E\u0440\u0442\u0438\u0432\u043D\u043E\u0435 \u043A\u0443\u043F\u0435", price: 25e3, icon: "\u{1F3CE}\uFE0F" },
  { id: "car3", category: "\u0422\u0440\u0430\u043D\u0441\u043F\u043E\u0440\u0442", name: "\u041B\u044E\u043A\u0441\u043E\u0432\u044B\u0439 \u0441\u0435\u0434\u0430\u043D", price: 6e4, icon: "\u{1F698}" },
  { id: "yacht1", category: "\u0422\u0440\u0430\u043D\u0441\u043F\u043E\u0440\u0442", name: "\u042F\u0445\u0442\u0430", price: 25e4, icon: "\u{1F6E5}\uFE0F" },
  { id: "home1", category: "\u041D\u0435\u0434\u0432\u0438\u0436\u0438\u043C\u043E\u0441\u0442\u044C", name: "\u041A\u0432\u0430\u0440\u0442\u0438\u0440\u0430-\u0441\u0442\u0443\u0434\u0438\u044F", price: 15e3, icon: "\u{1F3E2}" },
  { id: "home2", category: "\u041D\u0435\u0434\u0432\u0438\u0436\u0438\u043C\u043E\u0441\u0442\u044C", name: "\u0414\u043E\u043C \u0437\u0430 \u0433\u043E\u0440\u043E\u0434\u043E\u043C", price: 9e4, icon: "\u{1F3E1}" },
  { id: "home3", category: "\u041D\u0435\u0434\u0432\u0438\u0436\u0438\u043C\u043E\u0441\u0442\u044C", name: "\u041E\u0441\u043E\u0431\u043D\u044F\u043A", price: 4e5, icon: "\u{1F3F0}" },
  { id: "watch1", category: "\u0410\u043A\u0441\u0435\u0441\u0441\u0443\u0430\u0440\u044B", name: "\u0428\u0432\u0435\u0439\u0446\u0430\u0440\u0441\u043A\u0438\u0435 \u0447\u0430\u0441\u044B", price: 5e3, icon: "\u231A" },
  { id: "art1", category: "\u0410\u043A\u0441\u0435\u0441\u0441\u0443\u0430\u0440\u044B", name: "\u041F\u0440\u0435\u0434\u043C\u0435\u0442 \u0438\u0441\u043A\u0443\u0441\u0441\u0442\u0432\u0430", price: 2e4, icon: "\u{1F5BC}\uFE0F" }
];
var FOUNDER_PCT = { company: 0.6, crypto: 0.2 };
var DAY_MS = 15e3;
var RESELL_STARTUP = { registration: 500, rent: 800, equipment: 300 };
var OFFLINE_STORE_TIERS = {
  small: { id: "small", name: "\u041C\u0430\u043B\u0435\u043D\u044C\u043A\u0438\u0439 \u043C\u0430\u0433\u0430\u0437\u0438\u043D", openingCost: 1e4, rent: 2e3, salary: 1800, electricity: 200, extraMin: 100, extraMax: 2e3, baseFraction: 0.5, adCost: 1200, wellStockedValue: 8e3 },
  medium: { id: "medium", name: "\u0421\u0440\u0435\u0434\u043D\u0438\u0439 \u043C\u0430\u0433\u0430\u0437\u0438\u043D", openingCost: 3e4, rent: 15e3, salary: 4e3, electricity: 800, extraMin: 400, extraMax: 5e3, baseFraction: 0.65, adCost: 3500, wellStockedValue: 25e3 }
};
var OFFLINE_TICK_MS = 5 * 60 * 1e3;
var OFFLINE_BASE_BOOST = 10;
var OFFLINE_MAX_BOOST = 13;
var OFFLINE_AD_DURATION_TICKS = 3;
var PRODUCT_CATEGORIES = [
  { id: "clothes", name: "\u041E\u0434\u0435\u0436\u0434\u0430", icon: "\u{1F455}", priceMult: 0.4, marginMult: 0.75 },
  { id: "accessories", name: "\u0410\u043A\u0441\u0435\u0441\u0441\u0443\u0430\u0440\u044B", icon: "\u231A", priceMult: 0.65, marginMult: 0.9 },
  { id: "phones", name: "\u0422\u0435\u043B\u0435\u0444\u043E\u043D\u044B", icon: "\u{1F4F1}", priceMult: 1.7, marginMult: 1.25 },
  { id: "laptops", name: "\u041D\u043E\u0443\u0442\u0431\u0443\u043A\u0438", icon: "\u{1F4BB}", priceMult: 2.4, marginMult: 1.5 }
];
var SUPPLIERS = [
  { id: "cn_econ", country: "\u041A\u0438\u0442\u0430\u0439", flag: "\u{1F1E8}\u{1F1F3}", quality: "\u042D\u043A\u043E\u043D\u043E\u043C", pricePerUnit: 8, deliveryDays: 14, foreign: true, reviewScore: 0.35, companyTicker: "GZTC", desc: "\u0421\u0430\u043C\u0430\u044F \u043D\u0438\u0437\u043A\u0430\u044F \u0446\u0435\u043D\u0430, \u043D\u043E \u0432\u0441\u0442\u0440\u0435\u0447\u0430\u0435\u0442\u0441\u044F \u0431\u0440\u0430\u043A." },
  { id: "cn_std", country: "\u041A\u0438\u0442\u0430\u0439", flag: "\u{1F1E8}\u{1F1F3}", quality: "\u0421\u0442\u0430\u043D\u0434\u0430\u0440\u0442", pricePerUnit: 15, deliveryDays: 10, foreign: true, reviewScore: 0.6, companyTicker: "GZTC", desc: "\u0411\u0430\u043B\u0430\u043D\u0441 \u0446\u0435\u043D\u044B \u0438 \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u0430, \u0447\u0443\u0442\u044C \u0431\u044B\u0441\u0442\u0440\u0435\u0435 \u044D\u043A\u043E\u043D\u043E\u043C\u0430." },
  { id: "tr_std", country: "\u0422\u0443\u0440\u0446\u0438\u044F", flag: "\u{1F1F9}\u{1F1F7}", quality: "\u0421\u0442\u0430\u043D\u0434\u0430\u0440\u0442", pricePerUnit: 20, deliveryDays: 6, foreign: true, reviewScore: 0.65, companyTicker: "ISTX", desc: "\u0415\u0434\u0435\u0442 \u0437\u0430\u043C\u0435\u0442\u043D\u043E \u0431\u044B\u0441\u0442\u0440\u0435\u0435 \u041A\u0438\u0442\u0430\u044F." },
  { id: "de_prem", country: "\u0413\u0435\u0440\u043C\u0430\u043D\u0438\u044F", flag: "\u{1F1E9}\u{1F1EA}", quality: "\u041F\u0440\u0435\u043C\u0438\u0443\u043C", pricePerUnit: 45, deliveryDays: 8, foreign: true, reviewScore: 0.9, companyTicker: "DWHX", desc: "\u0422\u043E\u043F\u043E\u0432\u043E\u0435 \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u043E \u0431\u0435\u0437 \u0441\u044E\u0440\u043F\u0440\u0438\u0437\u043E\u0432, \u0434\u043E\u0440\u043E\u0433\u043E." },
  { id: "local_std", country: "\u041B\u043E\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u0441\u043A\u043B\u0430\u0434", flag: "\u{1F3E0}", quality: "\u0421\u0442\u0430\u043D\u0434\u0430\u0440\u0442", pricePerUnit: 25, deliveryDays: 2, foreign: false, reviewScore: 0.7, companyTicker: "LOKS", desc: "\u0411\u0435\u0437 \u0433\u0440\u0430\u043D\u0438\u0446\u044B \u0438 \u0440\u0430\u0441\u0442\u0430\u043C\u043E\u0436\u043A\u0438 \u2014 \u0431\u044B\u0441\u0442\u0440\u043E, \u043D\u043E \u0434\u043E\u0440\u043E\u0436\u0435 \u043E\u043F\u0442\u0430." }
];
var MARKET_INDEX_MS = 6e5;
var QUARTER_MS = 36e5;
var IP_TAX_RATE = 0.06;
var MARKETPLACE_FEE = 0.05;
var IP_BANK = { name: "\u0411\u0438\u0437\u043D\u0435\u0441\u041A\u0440\u0435\u0434\u0438\u0442", ticker: "BZKR", ratePerTick: 6e-4, maxLTV: 0.85, baseMax: 2e3, cashMult: 0.4, turnoverMult: 0.9 };
function newsImpactMult(c) {
  if (c.ticker === "TEHER") return 0.03;
  if (BANK_ACCOUNTS.some((b) => b.ticker === c.ticker) || c.ticker === IP_BANK.ticker) return 0.35;
  if (c.sector === "\u041A\u0440\u0438\u043F\u0442\u043E") return 1;
  return 0.55;
}
var AD_TIERS = [
  { id: "basic", name: "\u0411\u0430\u043D\u043D\u0435\u0440 \u043D\u0430 \u043C\u0430\u0440\u043A\u0435\u0442\u043F\u043B\u0435\u0439\u0441\u0435", cost: 150, boostMult: 1.5, durationMin: 5 },
  { id: "featured", name: "\u0422\u043E\u043F \u0432\u044B\u0434\u0430\u0447\u0438", cost: 450, boostMult: 2.2, durationMin: 8 },
  { id: "blast", name: "\u0420\u0430\u0441\u0441\u044B\u043B\u043A\u0430 \u0432\u0441\u0435\u043C \u043F\u043E\u043A\u0443\u043F\u0430\u0442\u0435\u043B\u044F\u043C", cost: 1e3, boostMult: 3.2, durationMin: 6 }
];
var INVESTOR_PERSONAS = [
  { id: "hype", name: "\u0410\u043A\u0443\u043B\u0430 \u0445\u0430\u0439\u043F\u0430", icon: "\u{1F988}", likes: "growth", wants: "\u0440\u043E\u0441\u0442 \u0430\u0443\u0434\u0438\u0442\u043E\u0440\u0438\u0438 \u0438 \u0445\u0430\u0439\u043F", color: "#FF5C5C" },
  { id: "fund", name: "\u041E\u0441\u0442\u043E\u0440\u043E\u0436\u043D\u044B\u0439 \u0444\u043E\u043D\u0434", icon: "\u{1F9E0}", likes: "rd", wants: "\u0440\u0430\u0437\u0440\u0430\u0431\u043E\u0442\u043A\u0443 \u0438 \u0441\u0442\u0430\u0431\u0438\u043B\u044C\u043D\u043E\u0441\u0442\u044C", color: "#5AA9E6" },
  { id: "whale", name: "\u041A\u0440\u0443\u043F\u043D\u044B\u0439 \u043A\u0430\u043F\u0438\u0442\u0430\u043B", icon: "\u{1F4B0}", likes: "cap", wants: "\u043A\u0430\u043F\u0438\u0442\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u044E \u0438 \u043F\u0440\u043E\u0448\u043B\u044B\u0435 \u0440\u0430\u0443\u043D\u0434\u044B", color: "#E8B14C" }
];
var PITCH_ANGLES = [
  { id: "growth", label: "\u0420\u043E\u0441\u0442 \u0430\u0443\u0434\u0438\u0442\u043E\u0440\u0438\u0438", icon: "\u{1F4E3}" },
  { id: "rd", label: "\u0420\u0430\u0437\u0440\u0430\u0431\u043E\u0442\u043A\u0443", icon: "\u{1F9EA}" },
  { id: "cap", label: "\u041A\u0430\u043F\u0438\u0442\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u044E", icon: "\u{1F4CA}" }
];
var STORAGE_KEY = "market-sandbox-v6";
var DUE_CYCLE_SECONDS = 60;
var CANDLE_MS = 6e4;
function gauss() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
function makeId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}
function fmt(n) {
  if (n == null || isNaN(n)) return "$0.00";
  const abs = Math.abs(n);
  if (abs >= 1e3) return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: abs < 5 ? 4 : 2 });
}
function seedCandles(price, vol) {
  const candles = [];
  let p = price * (1 - 0.08);
  const now = Date.now();
  const N = 72;
  for (let i = 0; i < N; i++) {
    const o = p;
    const drift = (Math.random() - 0.5) * vol * 1.5;
    const c = Math.max(0.01, o * (1 + drift / 100));
    const h = Math.max(o, c) * (1 + Math.random() * 0.01);
    const l = Math.min(o, c) * (1 - Math.random() * 0.01);
    candles.push({ o, h, l, c, t: now - (N - i) * CANDLE_MS });
    p = c;
  }
  return { candles, lastPrice: p };
}
function seedCompanies() {
  return NPC_SEED.map((s) => {
    const { candles, lastPrice } = seedCandles(s.price, s.vol);
    return { id: makeId("npc"), name: s.name, ticker: s.ticker, sector: s.sector, price: lastPrice, vol: s.vol, supply: s.supply, isPlayer: false, candles };
  });
}
function Sparkline({ data, color, width = 60, height = 26 }) {
  if (!data || data.length < 2) return /* @__PURE__ */ jsx("svg", { width, height });
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);
  const points = data.map((d, i) => `${i * step},${height - (d - min) / range * height}`).join(" ");
  return /* @__PURE__ */ jsx("svg", { width, height, style: { display: "block", flexShrink: 0 }, children: /* @__PURE__ */ jsx("polyline", { points, fill: "none", stroke: color, strokeWidth: "1.5", strokeLinejoin: "round", strokeLinecap: "round" }) });
}
function PriceChart({ data, color, height = 130 }) {
  const width = 320;
  if (!data || data.length < 2) return /* @__PURE__ */ jsx("div", { style: { height } });
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);
  const pts = data.map((d, i) => [i * step, height - (d - min) / range * (height - 16) - 8]);
  const line = pts.map((p) => p.join(",")).join(" ");
  const area = `0,${height} ${line} ${width},${height}`;
  const gid = `g${color.replace("#", "")}`;
  return /* @__PURE__ */ jsxs("svg", { viewBox: `0 0 ${width} ${height}`, style: { width: "100%", height, display: "block" }, preserveAspectRatio: "none", children: [
    /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: gid, x1: "0", y1: "0", x2: "0", y2: "1", children: [
      /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: color, stopOpacity: "0.35" }),
      /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: color, stopOpacity: "0" })
    ] }) }),
    /* @__PURE__ */ jsx("polygon", { points: area, fill: `url(#${gid})` }),
    /* @__PURE__ */ jsx("polyline", { points: line, fill: "none", stroke: color, strokeWidth: "2", strokeLinejoin: "round", strokeLinecap: "round" })
  ] });
}
var UP_COLOR = "#1FCB79";
var DOWN_COLOR = "#FF4D5E";
function fmtAxisPrice(n) {
  if (n == null || isNaN(n)) return "0.00";
  const abs = Math.abs(n);
  const decimals = abs < 5 ? 4 : abs < 1e3 ? 2 : 2;
  return n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
function fmtCompactNum(n) {
  if (n == null || isNaN(n)) return "0";
  const abs = Math.abs(n);
  if (abs >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (abs >= 1e3) return (n / 1e3).toFixed(2) + "K";
  return n.toFixed(0);
}
function fmtClock(ms) {
  const d = new Date(ms);
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}
function fmtHM(ms) {
  const d = new Date(ms);
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())}`;
}
var TIMEFRAMES = [
  { id: "1m", label: "1\u043C", group: 1 },
  { id: "5m", label: "5\u043C", group: 5 },
  { id: "15m", label: "15\u043C", group: 15 },
  { id: "1h", label: "1\u0447", group: 60 }
];
var ZOOM_LEVELS = [22, 36, 52, 70, 90];
function aggregateCandles(candles, groupSize) {
  if (groupSize <= 1) return (candles || []).map((c) => ({ ...c, _partial: false }));
  const groups = [];
  for (let i = 0; i < candles.length; i += groupSize) {
    const chunk = candles.slice(i, i + groupSize);
    if (!chunk.length) continue;
    groups.push({
      o: chunk[0].o,
      h: Math.max(...chunk.map((c) => c.h)),
      l: Math.min(...chunk.map((c) => c.l)),
      c: chunk[chunk.length - 1].c,
      t: chunk[0].t,
      _partial: chunk.length < groupSize
    });
  }
  return groups;
}
function CandleChart({ companyId, engineRef, candles, height = 210 }) {
  const canvasRef = useRef(null);
  const [timeframe, setTimeframe] = useState("1m");
  const [zoomIdx, setZoomIdx] = useState(2);
  useEffect(() => {
    let raf;
    const tf = TIMEFRAMES.find((t) => t.id === timeframe) || TIMEFRAMES[0];
    const visibleCount = ZOOM_LEVELS[zoomIdx] ?? 52;
    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        raf = requestAnimationFrame(draw);
        return;
      }
      const width = canvas.clientWidth || 300;
      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
      }
      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, width, height);
      const e = engineRef.current[companyId];
      const groups = aggregateCandles(candles || [], tf.group);
      let bars;
      if (e) {
        const last = groups[groups.length - 1];
        if (last && last._partial) {
          const merged = { o: last.o, h: Math.max(last.h, e.cHigh, e.price), l: Math.min(last.l, e.cLow, e.price), c: e.price, t: last.t, forming: true };
          bars = [...groups.slice(0, -1), merged];
        } else {
          bars = [...groups, { o: e.cOpen, h: e.cHigh, l: e.cLow, c: e.price, t: Date.now(), forming: true }];
        }
      } else {
        bars = groups;
      }
      bars = bars.slice(-visibleCount).map((b) => ({ ...b }));
      if (bars.length >= 2) {
        const rightMargin = 58;
        const bottomMargin = 16;
        const topMargin = 14;
        const volGap = 8;
        const chartW = Math.max(10, width - rightMargin);
        const mainH = Math.round((height - bottomMargin - topMargin - volGap) * 0.7);
        const volH = height - bottomMargin - topMargin - volGap - mainH;
        const mainTop = topMargin;
        const volTop = topMargin + mainH + volGap;
        const allVals = bars.reduce((acc, b) => acc.concat([b.o, b.h, b.l, b.c]), []);
        const min = Math.min(...allVals);
        const max = Math.max(...allVals);
        const range = max - min || 1;
        const slotW = chartW / bars.length;
        const bodyW = Math.max(2.5, slotW * 0.62);
        const yFor = (v) => mainTop + mainH - (v - min) / range * mainH;
        const pill = (text, x, y, align, color) => {
          ctx.font = "9.5px 'JetBrains Mono', monospace";
          const tw = ctx.measureText(text).width;
          const px = align === "left" ? x : align === "right" ? x - tw : x - tw / 2;
          ctx.fillStyle = "rgba(11,14,20,0.82)";
          ctx.fillRect(px - 4, y - 7, tw + 8, 14);
          ctx.fillStyle = color;
          ctx.textAlign = "left";
          ctx.fillText(text, px, y + 3.5);
        };
        ctx.strokeStyle = "rgba(255,255,255,0.06)";
        ctx.lineWidth = 1;
        const GRID_N = 4;
        for (let g = 0; g <= GRID_N; g++) {
          const frac = g / GRID_N;
          const y = mainTop + mainH * frac;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(chartW, y);
          ctx.stroke();
          const val = max - frac * range;
          const ty = g === 0 ? y + 6 : g === GRID_N ? y - 6 : y;
          pill(fmtAxisPrice(val), chartW + 6, ty, "left", "#8B93A7");
        }
        ctx.save();
        ctx.globalAlpha = 0.045;
        ctx.fillStyle = "#E7EAEE";
        ctx.font = "bold 24px 'Space Grotesk', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("MARKET", chartW / 2, mainTop + mainH / 2);
        ctx.restore();
        bars.forEach((b, i) => {
          const x = i * slotW + slotW / 2;
          const up = b.c >= b.o;
          const color = up ? UP_COLOR : DOWN_COLOR;
          ctx.strokeStyle = color;
          ctx.fillStyle = color;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x, yFor(b.h));
          ctx.lineTo(x, yFor(b.l));
          ctx.stroke();
          const yOpen = yFor(b.o);
          const yClose = yFor(b.c);
          const top = Math.min(yOpen, yClose);
          const bh = Math.max(1.5, Math.abs(yClose - yOpen));
          ctx.globalAlpha = b.forming ? 0.88 : 1;
          ctx.fillRect(x - bodyW / 2, top, bodyW, bh);
          ctx.globalAlpha = 1;
        });
        let hiIdx = 0, loIdx = 0;
        bars.forEach((b, i) => {
          if (b.h > bars[hiIdx].h) hiIdx = i;
          if (b.l < bars[loIdx].l) loIdx = i;
        });
        ctx.setLineDash([3, 3]);
        ctx.lineWidth = 1;
        [{ idx: hiIdx, val: max, top: true }, { idx: loIdx, val: min, top: false }].forEach((m) => {
          const y = yFor(m.val);
          ctx.strokeStyle = "rgba(255,255,255,0.3)";
          ctx.beginPath();
          ctx.moveTo(2, y);
          ctx.lineTo(m.idx * slotW + slotW / 2, y);
          ctx.stroke();
          pill(fmtAxisPrice(m.val), 4, m.top ? Math.max(y - 10, 8) : Math.min(y + 10, mainTop + mainH - 4), "left", "#E7EAEE");
        });
        ctx.setLineDash([]);
        if (e) {
          const py = yFor(e.price);
          const up = e.price >= e.cOpen;
          const lineColor = up ? UP_COLOR : DOWN_COLOR;
          ctx.setLineDash([2, 3]);
          ctx.strokeStyle = lineColor;
          ctx.beginPath();
          ctx.moveTo(0, py);
          ctx.lineTo(chartW, py);
          ctx.stroke();
          ctx.setLineDash([]);
          const boxW = rightMargin - 2;
          const boxH = 26;
          let boxY = Math.min(Math.max(py - boxH / 2, mainTop), mainTop + mainH - boxH);
          ctx.fillStyle = lineColor;
          ctx.fillRect(chartW + 2, boxY, boxW, boxH);
          ctx.fillStyle = "#0B0E14";
          ctx.textAlign = "left";
          ctx.font = "bold 10px 'JetBrains Mono', monospace";
          ctx.fillText(fmtAxisPrice(e.price), chartW + 6, boxY + 10);
          ctx.font = "9px 'JetBrains Mono', monospace";
          ctx.fillText(fmtClock(Date.now()), chartW + 6, boxY + 20);
        }
        const vols = bars.map((b, i) => Math.abs(b.h - b.l) / range * 260 + (i * 37 + 11) % 19 * 4 + 6);
        const maxVol = Math.max(...vols, 1);
        const volBodyW = Math.max(1.5, slotW * 0.62);
        ctx.strokeStyle = "rgba(255,255,255,0.05)";
        ctx.beginPath();
        ctx.moveTo(0, volTop);
        ctx.lineTo(chartW, volTop);
        ctx.stroke();
        bars.forEach((b, i) => {
          const x = i * slotW + slotW / 2;
          const up = b.c >= b.o;
          const vh = Math.max(1, vols[i] / maxVol * volH);
          ctx.globalAlpha = 0.5;
          ctx.fillStyle = up ? UP_COLOR : DOWN_COLOR;
          ctx.fillRect(x - volBodyW / 2, volTop + volH - vh, volBodyW, vh);
          ctx.globalAlpha = 1;
        });
        ctx.font = "9px 'JetBrains Mono', monospace";
        ctx.textAlign = "left";
        ctx.fillStyle = DOWN_COLOR;
        ctx.fillText(`VOL ${fmtCompactNum(vols[vols.length - 1])}`, 2, volTop - 3);
        ctx.fillStyle = "#7A8494";
        ctx.textBaseline = "alphabetic";
        const labelCount = 4;
        for (let k = 0; k < labelCount; k++) {
          const idx = Math.round(k / (labelCount - 1) * (bars.length - 1));
          const b = bars[idx];
          if (!b || !b.t) continue;
          const x = idx * slotW + slotW / 2;
          ctx.textAlign = k === 0 ? "left" : k === labelCount - 1 ? "right" : "center";
          ctx.fillText(fmtHM(b.t), Math.min(Math.max(x, 14), chartW - 14), height - 3);
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [companyId, candles, engineRef, height, timeframe, zoomIdx]);
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }, children: [
      /* @__PURE__ */ jsx("div", { style: { display: "flex", gap: 4 }, children: TIMEFRAMES.map((t) => /* @__PURE__ */ jsx("button", { onClick: () => setTimeframe(t.id), style: { padding: "4px 8px", borderRadius: 6, border: "none", fontSize: 10.5, fontWeight: 700, background: timeframe === t.id ? C.gold : "transparent", color: timeframe === t.id ? "#161207" : C.inkFaint, cursor: "pointer" }, children: t.label }, t.id)) }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 4 }, children: [
        /* @__PURE__ */ jsx("button", { onClick: () => setZoomIdx((z) => Math.min(ZOOM_LEVELS.length - 1, z + 1)), disabled: zoomIdx === ZOOM_LEVELS.length - 1, style: { width: 22, height: 22, borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", color: zoomIdx === ZOOM_LEVELS.length - 1 ? C.inkFaint : C.inkDim, fontSize: 13, lineHeight: 1, cursor: "pointer" }, children: "\u2212" }),
        /* @__PURE__ */ jsx("button", { onClick: () => setZoomIdx((z) => Math.max(0, z - 1)), disabled: zoomIdx === 0, style: { width: 22, height: 22, borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", color: zoomIdx === 0 ? C.inkFaint : C.inkDim, fontSize: 13, lineHeight: 1, cursor: "pointer" }, children: "+" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("canvas", { ref: canvasRef, style: { width: "100%", height, display: "block", background: "#000" } })
  ] });
}
function CompanyRow({ c, onClick }) {
  const openRef = c.candles && c.candles[0] ? c.candles[0].o : c.price;
  const change = (c.price - openRef) / openRef * 100;
  const color = c.rugged ? C.red : change >= 0 ? C.green : C.red;
  const badgeColor = c.isPlayer ? c.rugged ? C.red : C.gold : C.inkDim;
  const sparkData = [...(c.candles || []).map((cd) => cd.c), c.price];
  return /* @__PURE__ */ jsxs("button", { onClick, style: { width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 14px", marginBottom: 8, textAlign: "left" }, children: [
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10, minWidth: 0 }, children: [
      /* @__PURE__ */ jsx("div", { style: { width: 38, height: 38, borderRadius: 8, background: C.surface2, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, fontWeight: 700, color: badgeColor, border: c.isPlayer ? `1px solid ${badgeColor}` : "none", flexShrink: 0 }, children: c.ticker.slice(0, 4) }),
      /* @__PURE__ */ jsxs("div", { style: { minWidth: 0 }, children: [
        /* @__PURE__ */ jsx("div", { style: { fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }, children: c.name }),
        /* @__PURE__ */ jsxs("div", { style: { fontSize: 11, color: C.inkDim }, children: [
          c.sector,
          c.isPlayer ? " \xB7 \u0442\u0432\u043E\u044F" : "",
          c.rugged ? " \xB7 \u0441\u043A\u0430\u043C" : ""
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }, children: [
      /* @__PURE__ */ jsx(Sparkline, { data: sparkData, color }),
      /* @__PURE__ */ jsxs("div", { style: { textAlign: "right" }, children: [
        /* @__PURE__ */ jsx("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 600 }, children: fmt(c.price) }),
        /* @__PURE__ */ jsxs("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color }, children: [
          change >= 0 ? "+" : "",
          change.toFixed(1),
          "%"
        ] })
      ] })
    ] })
  ] });
}
function AccountRow({ icon, iconBg, iconColor, amount, label, badge, onClick }) {
  return /* @__PURE__ */ jsxs("button", { onClick, style: { width: "100%", display: "flex", alignItems: "center", gap: 14, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16, marginBottom: 12, textAlign: "left" }, children: [
    /* @__PURE__ */ jsx("div", { style: { width: 44, height: 44, borderRadius: "50%", background: iconBg, color: iconColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }, children: icon }),
    /* @__PURE__ */ jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [
      /* @__PURE__ */ jsx("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 19, fontWeight: 700 }, children: amount }),
      /* @__PURE__ */ jsx("div", { style: { fontSize: 12.5, color: C.inkDim, marginTop: 2 }, children: label })
    ] }),
    badge && /* @__PURE__ */ jsx("div", { style: { background: C.surface2, borderRadius: 20, padding: "6px 10px", fontSize: 11.5, color: C.gold, fontWeight: 700, flexShrink: 0, whiteSpace: "nowrap" }, children: badge })
  ] });
}
var inputStyle = { width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "11px 12px", color: C.ink, fontSize: 14, marginBottom: 12, marginTop: 6, outline: "none" };
var qtyBtnStyle = { width: 36, height: 36, borderRadius: 8, border: "none", background: C.surface, color: C.ink, fontSize: 18, fontWeight: 700 };
var choiceCardStyle = (active, color = C.gold) => ({ flex: 1, textAlign: "left", padding: "12px 12px", borderRadius: 12, border: `1px solid ${active ? color : C.border}`, background: active ? `${color}18` : C.surface });
var actionBtnStyle = (enabled, color = C.gold) => ({ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: enabled ? color : C.surface2, color: enabled ? "#161207" : C.inkDim, border: "none", borderRadius: 12, padding: 14, fontWeight: 700, fontSize: 14, marginBottom: 10 });
var segStyle = (active) => ({ flex: "1 1 auto", minWidth: 70, padding: "9px 6px", borderRadius: 10, border: "none", fontWeight: 700, fontSize: 11.5, background: active ? C.gold : C.surface2, color: active ? "#161207" : C.inkDim });
var pctBtnStyle = { flex: "1 1 auto", minWidth: 44, padding: "7px 0", borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface2, color: C.inkDim, fontSize: 11.5, fontWeight: 600 };
function MarketSandbox() {
  const [loaded, setLoaded] = useState(false);
  const [cash, setCash] = useState(1e3);
  const [onboarded, setOnboarded] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [holdings, setHoldings] = useState({});
  const [playerVentureId, setPlayerVentureId] = useState(null);
  const [activeTab, setActiveTab] = useState("market");
  const [cabinetSubTab, setCabinetSubTab] = useState("card");
  const [selectedId, setSelectedId] = useState(null);
  const [feedPosts, setFeedPosts] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [pullY, setPullY] = useState(0);
  const [pendingRumors, setPendingRumors] = useState([]);
  const [netWorthHistory, setNetWorthHistory] = useState([]);
  const [tradeQty, setTradeQty] = useState(1);
  const [tradeSide, setTradeSide] = useState("buy");
  const [form, setForm] = useState({ name: "", ticker: "", sector: SECTORS[0], kind: "company", strategy: "tech" });
  const [confirmReset, setConfirmReset] = useState(false);
  const [loans, setLoans] = useState([]);
  const [job, setJob] = useState(null);
  const [jobHistory, setJobHistory] = useState({});
  const [jobCooldown, setJobCooldown] = useState(0);
  const [taxOwed, setTaxOwed] = useState(0);
  const [taxOverdueSeconds, setTaxOverdueSeconds] = useState(0);
  const [taxHistory, setTaxHistory] = useState([]);
  const [cardLast4, setCardLast4] = useState("0000");
  const [suspicion, setSuspicion] = useState(0);
  const [reputation, setReputation] = useState(100);
  const [loanInputs, setLoanInputs] = useState({});
  const [loanFeedback, setLoanFeedback] = useState({});
  const [bankRatings, setBankRatings] = useState({ mfo: 50, priv: 50, fed: 50 });
  const [ipBankRating, setIpBankRating] = useState(50);
  const [hypePosts, setHypePosts] = useState([]);
  const [fines, setFines] = useState([]);
  const [confirmCloseVenture, setConfirmCloseVenture] = useState(false);
  const [bonds, setBonds] = useState([]);
  const [bondInputs, setBondInputs] = useState({});
  const [ownedItems, setOwnedItems] = useState({});
  const [investorPersona, setInvestorPersona] = useState(null);
  const [leveragedPositions, setLeveragedPositions] = useState([]);
  const [tradeLeverage, setTradeLeverage] = useState(1);
  const [ipHoldings, setIpHoldings] = useState({});
  const [tradeAccount, setTradeAccount] = useState("personal");
  const [tradeQtyMode, setTradeQtyMode] = useState("qty");
  const [tradeAmountInput, setTradeAmountInput] = useState("");
  const [resellShops, setResellShops] = useState([]);
  const [orderQtyInputs, setOrderQtyInputs] = useState({});
  const [orderCategorySel, setOrderCategorySel] = useState({});
  const [listedPriceInputs, setListedPriceInputs] = useState({});
  const [bizPath, setBizPath] = useState(null);
  const [confirmCloseResell, setConfirmCloseResell] = useState(null);
  const [confirmCloseOffline, setConfirmCloseOffline] = useState(null);
  const [ipCash, setIpCash] = useState(0);
  const [ipTaxOwed, setIpTaxOwed] = useState(0);
  const [quarterRevenue, setQuarterRevenue] = useState(0);
  const [quarterEndsAt, setQuarterEndsAt] = useState(() => Date.now() + QUARTER_MS);
  const [declarations, setDeclarations] = useState([]);
  const [ipLoans, setIpLoans] = useState([]);
  const [ipLoanInput, setIpLoanInput] = useState("");
  const [ipLoanFeedback, setIpLoanFeedback] = useState(null);
  const [ipTransferInput, setIpTransferInput] = useState("");
  const [marketIndex, setMarketIndex] = useState(1);
  const [ipTab, setIpTab] = useState("account");
  const [bankAccounts, setBankAccounts] = useState({});
  const [transferSuspicion, setTransferSuspicion] = useState(0);
  const [lastLargeTransferBank, setLastLargeTransferBank] = useState(null);
  const [bankTransferInputs, setBankTransferInputs] = useState({});
  const [bankTransferFeedback, setBankTransferFeedback] = useState({});
  const [bankTransferDest, setBankTransferDest] = useState({});
  const [greyAccount, setGreyAccount] = useState(null);
  const [greyHoldings, setGreyHoldings] = useState({});
  const [greySuspicion, setGreySuspicion] = useState(0);
  const [greyTransferInput, setGreyTransferInput] = useState("");
  const [greyTransferDest, setGreyTransferDest] = useState("ip");
  const [greyFeedback, setGreyFeedback] = useState(null);
  const [blackMarketRound, setBlackMarketRound] = useState(null);
  const [blackMarketOffers, setBlackMarketOffers] = useState([]);
  const [darkTab, setDarkTab] = useState("services");
  const [ipTurnoverUsed, setIpTurnoverUsed] = useState(0);
  const [ipTurnoverResetAt, setIpTurnoverResetAt] = useState(() => Date.now() + TURNOVER_RESET_MS);
  const [blackMarketVolume, setBlackMarketVolume] = useState(0);
  const [blackMarketHeat, setBlackMarketHeat] = useState(0);
  const [blackMarketRoundsDone, setBlackMarketRoundsDone] = useState(0);
  const [muleCards, setMuleCards] = useState({});
  const [muleTransferInputs, setMuleTransferInputs] = useState({});
  const [muleTransferDest, setMuleTransferDest] = useState({});
  const [muleFeedback, setMuleFeedback] = useState({});
  const [promoDismissed, setPromoDismissed] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [focusedBankId, setFocusedBankId] = useState(null);
  const [showTransferPanel, setShowTransferPanel] = useState(false);
  const [xferFrom, setXferFrom] = useState("personal");
  const [xferTo, setXferTo] = useState("ip");
  const [xferAmount, setXferAmount] = useState("");
  const [xferFeedback, setXferFeedback] = useState(null);
  const [payFromAccount, setPayFromAccount] = useState("personal");
  const [exportFlash, setExportFlash] = useState(false);
  const [importError, setImportError] = useState(null);
  const [exportText, setExportText] = useState("");
  const [importText, setImportText] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [selectedBizId, setSelectedBizId] = useState(null);
  const [viewingCompanyId, setViewingCompanyId] = useState(null);
  const engineRef = useRef({});
  const lastPumpAtRef = useRef(0);
  const pendingBufferRef = useRef([]);
  const touchStartYRef = useRef(null);
  const suspicionRef = useRef(0);
  const reputationRef = useRef(100);
  const cashRef = useRef(cash);
  const onboardedRef = useRef(onboarded);
  const holdingsRef = useRef(holdings);
  const ipHoldingsRef = useRef(ipHoldings);
  const companiesRef = useRef(companies);
  const playerVentureIdRef = useRef(playerVentureId);
  const loansRef = useRef(loans);
  const bankRatingsRef = useRef(bankRatings);
  const bankAccountsRef = useRef(bankAccounts);
  const transferSuspicionRef = useRef(transferSuspicion);
  const lastLargeTransferBankRef = useRef(lastLargeTransferBank);
  const greyAccountRef = useRef(greyAccount);
  const greyHoldingsRef = useRef(greyHoldings);
  const greySuspicionRef = useRef(greySuspicion);
  const blackMarketVolumeRef = useRef(blackMarketVolume);
  const blackMarketHeatRef = useRef(blackMarketHeat);
  const blackMarketRoundRef = useRef(blackMarketRound);
  const ipTurnoverUsedRef = useRef(ipTurnoverUsed);
  const ipTurnoverResetAtRef = useRef(ipTurnoverResetAt);
  const blackMarketRoundsDoneRef = useRef(blackMarketRoundsDone);
  const muleCardsRef = useRef(muleCards);
  const ipBankRatingRef = useRef(ipBankRating);
  const jobRef = useRef(job);
  const jobHistoryRef = useRef(jobHistory);
  const pendingRumorsRef = useRef(pendingRumors);
  const taxHistoryRef = useRef(taxHistory);
  const finesRef = useRef(fines);
  const taxOwedRef = useRef(taxOwed);
  const cardLast4Ref = useRef(cardLast4);
  const bondsRef = useRef(bonds);
  const ownedItemsRef = useRef(ownedItems);
  const leveragedPositionsRef = useRef(leveragedPositions);
  const resellShopsRef = useRef(resellShops);
  const transactionsRef = useRef(transactions);
  const ipCashRef = useRef(ipCash);
  const ipTaxOwedRef = useRef(ipTaxOwed);
  const quarterRevenueRef = useRef(quarterRevenue);
  const quarterEndsAtRef = useRef(quarterEndsAt);
  const declarationsRef = useRef(declarations);
  const ipLoansRef = useRef(ipLoans);
  const marketIndexRef = useRef(marketIndex);
  useEffect(() => {
    cashRef.current = cash;
  }, [cash]);
  useEffect(() => {
    onboardedRef.current = onboarded;
  }, [onboarded]);
  useEffect(() => {
    holdingsRef.current = holdings;
  }, [holdings]);
  useEffect(() => {
    ipHoldingsRef.current = ipHoldings;
  }, [ipHoldings]);
  useEffect(() => {
    companiesRef.current = companies;
  }, [companies]);
  useEffect(() => {
    playerVentureIdRef.current = playerVentureId;
  }, [playerVentureId]);
  useEffect(() => {
    loansRef.current = loans;
  }, [loans]);
  useEffect(() => {
    bankRatingsRef.current = bankRatings;
  }, [bankRatings]);
  useEffect(() => {
    bankAccountsRef.current = bankAccounts;
  }, [bankAccounts]);
  useEffect(() => {
    transferSuspicionRef.current = transferSuspicion;
  }, [transferSuspicion]);
  useEffect(() => {
    lastLargeTransferBankRef.current = lastLargeTransferBank;
  }, [lastLargeTransferBank]);
  useEffect(() => {
    greyAccountRef.current = greyAccount;
  }, [greyAccount]);
  useEffect(() => {
    greyHoldingsRef.current = greyHoldings;
  }, [greyHoldings]);
  useEffect(() => {
    greySuspicionRef.current = greySuspicion;
  }, [greySuspicion]);
  useEffect(() => {
    blackMarketVolumeRef.current = blackMarketVolume;
  }, [blackMarketVolume]);
  useEffect(() => {
    blackMarketHeatRef.current = blackMarketHeat;
  }, [blackMarketHeat]);
  useEffect(() => {
    blackMarketRoundRef.current = blackMarketRound;
  }, [blackMarketRound]);
  useEffect(() => {
    ipTurnoverUsedRef.current = ipTurnoverUsed;
  }, [ipTurnoverUsed]);
  useEffect(() => {
    ipTurnoverResetAtRef.current = ipTurnoverResetAt;
  }, [ipTurnoverResetAt]);
  useEffect(() => {
    blackMarketRoundsDoneRef.current = blackMarketRoundsDone;
  }, [blackMarketRoundsDone]);
  useEffect(() => {
    muleCardsRef.current = muleCards;
  }, [muleCards]);
  useEffect(() => {
    ipBankRatingRef.current = ipBankRating;
  }, [ipBankRating]);
  useEffect(() => {
    jobRef.current = job;
  }, [job]);
  useEffect(() => {
    jobHistoryRef.current = jobHistory;
  }, [jobHistory]);
  useEffect(() => {
    pendingRumorsRef.current = pendingRumors;
  }, [pendingRumors]);
  useEffect(() => {
    taxHistoryRef.current = taxHistory;
  }, [taxHistory]);
  useEffect(() => {
    finesRef.current = fines;
  }, [fines]);
  useEffect(() => {
    taxOwedRef.current = taxOwed;
  }, [taxOwed]);
  useEffect(() => {
    cardLast4Ref.current = cardLast4;
  }, [cardLast4]);
  useEffect(() => {
    bondsRef.current = bonds;
  }, [bonds]);
  useEffect(() => {
    ownedItemsRef.current = ownedItems;
  }, [ownedItems]);
  useEffect(() => {
    leveragedPositionsRef.current = leveragedPositions;
  }, [leveragedPositions]);
  useEffect(() => {
    resellShopsRef.current = resellShops;
  }, [resellShops]);
  useEffect(() => {
    transactionsRef.current = transactions;
  }, [transactions]);
  useEffect(() => {
    ipCashRef.current = ipCash;
  }, [ipCash]);
  useEffect(() => {
    ipTaxOwedRef.current = ipTaxOwed;
  }, [ipTaxOwed]);
  useEffect(() => {
    quarterRevenueRef.current = quarterRevenue;
  }, [quarterRevenue]);
  useEffect(() => {
    quarterEndsAtRef.current = quarterEndsAt;
  }, [quarterEndsAt]);
  useEffect(() => {
    declarationsRef.current = declarations;
  }, [declarations]);
  useEffect(() => {
    ipLoansRef.current = ipLoans;
  }, [ipLoans]);
  useEffect(() => {
    marketIndexRef.current = marketIndex;
  }, [marketIndex]);
  useEffect(() => {
    suspicionRef.current = suspicion;
  }, [suspicion]);
  useEffect(() => {
    reputationRef.current = reputation;
  }, [reputation]);
  useEffect(() => {
    if (!loaded) return;
    const id = setInterval(() => {
      setReputation((r) => r < 100 ? Math.min(100, Number((r + 0.4).toFixed(1))) : r);
    }, 2e4);
    return () => clearInterval(id);
  }, [loaded]);
  const repFactor = Math.max(0.15, reputation / 100);
  const repRateMult = 1 + (100 - reputation) / 100;
  const repPriceMult = 1 + (100 - reputation) / 100 * 0.5;
  const applyImpact = (companyId, pct) => {
    const e = engineRef.current[companyId];
    if (!e) return;
    e.price = Math.max(0.01, e.price * (1 + pct / 100));
    e.cHigh = Math.max(e.cHigh, e.price);
    e.cLow = Math.min(e.cLow, e.price);
  };
  const accrueTax = (label, amount) => {
    if (amount <= 0) return;
    setTaxOwed((o) => Number((o + amount).toFixed(2)));
    setTaxHistory((h) => [{ id: makeId("tax"), label, amount, kind: "accrual" }, ...h].slice(0, 60));
  };
  const flagSuspicion = (points) => {
    if (points <= 0) return;
    setSuspicion((s) => Math.min(200, s + points));
  };
  const flagTransferSuspicion = (bankId, points) => {
    if (points <= 0) return;
    setTransferSuspicion((s) => Math.min(200, s + points));
    setLastLargeTransferBank(bankId);
  };
  const trackIpTurnover = (amount) => {
    if (amount <= 0) return;
    const prevUsed = ipTurnoverUsedRef.current;
    const newUsed = prevUsed + amount;
    const overageBefore = Math.max(0, prevUsed - IP_TURNOVER_CAP);
    const overageAfter = Math.max(0, newUsed - IP_TURNOVER_CAP);
    const newOverage = overageAfter - overageBefore;
    setIpTurnoverUsed(newUsed);
    if (newOverage > 0) {
      const tax = Math.round(newOverage * IP_WEALTH_TAX_RATE);
      setIpCash((c) => Math.max(0, c - tax));
      logTx("\u041D\u0430\u043B\u043E\u0433 \u043D\u0430 \u0431\u043E\u0433\u0430\u0442\u0441\u0442\u0432\u043E \u0418\u041F (7% \u0441\u0432\u0435\u0440\u0445 \u043E\u0431\u043E\u0440\u043E\u0442\u0430 $100k)", tax, "out");
      pushPost({ text: "\u0418\u041F \u043F\u0440\u0435\u0432\u044B\u0441\u0438\u043B \u0431\u0435\u0437\u043E\u043F\u0430\u0441\u043D\u044B\u0439 \u043E\u0431\u043E\u0440\u043E\u0442 \u0432 \u043A\u0432\u0430\u0440\u0442\u0430\u043B\u0435 \u2014 \u043D\u0430\u0447\u0438\u0441\u043B\u0435\u043D \u0434\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u043D\u0430\u043B\u043E\u0433 \u043D\u0430 \u0431\u043E\u0433\u0430\u0442\u0441\u0442\u0432\u043E", positive: false, isMacro: false });
    }
  };
  const adjustReputation = (delta) => {
    setReputation((r) => Math.max(0, Math.min(100, Number((r + delta).toFixed(1)))));
  };
  const logTx = (label, amount, dir) => {
    setTransactions((prev) => [{ id: makeId("tx"), label, amount: Math.round(Math.abs(amount) * 100) / 100, dir, ts: Date.now() }, ...prev].slice(0, 120));
  };
  const adjustBankRating = (bankId, delta, spillover = 0) => {
    setBankRatings((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((id) => {
        next[id] = Math.max(0, Math.min(100, Number((next[id] + (id === bankId ? delta : spillover)).toFixed(1))));
      });
      return next;
    });
    if (bankId !== "ip") {
      setIpBankRating((r) => Math.max(0, Math.min(100, Number((r + spillover).toFixed(1)))));
    }
  };
  const adjustIpBankRating = (delta, spillover = 0) => {
    setIpBankRating((r) => Math.max(0, Math.min(100, Number((r + delta).toFixed(1)))));
    setBankRatings((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((id) => {
        next[id] = Math.max(0, Math.min(100, Number((next[id] + spillover).toFixed(1))));
      });
      return next;
    });
  };
  const flagLeveragedPumpPattern = (companyId, pumpPct) => {
    const exposed = leveragedPositions.filter((p) => p.companyId === companyId);
    if (!exposed.length || pumpPct <= 0) return;
    const totalNotional = exposed.reduce((s, p) => s + p.margin * p.leverage, 0);
    const points = Math.min(70, totalNotional / 400 * (pumpPct / 8) * 3);
    flagSuspicion(points);
    if (points > 12) {
      pushPost({ text: "\u0410\u043D\u0430\u043B\u0438\u0442\u0438\u043A\u0438 \u0437\u0430\u043C\u0435\u0442\u0438\u043B\u0438 \u0441\u0442\u0440\u0430\u043D\u043D\u043E\u0435 \u0441\u043E\u0432\u043F\u0430\u0434\u0435\u043D\u0438\u0435: \u0443 \u0438\u043D\u0441\u0430\u0439\u0434\u0435\u0440\u0430 \u043E\u0442\u043A\u0440\u044B\u0442\u0430 \u043A\u0440\u0443\u043F\u043D\u0430\u044F \u043F\u043E\u0437\u0438\u0446\u0438\u044F \u043A\u0430\u043A \u0440\u0430\u0437 \u043F\u0435\u0440\u0435\u0434 \u0440\u043E\u0441\u0442\u043E\u043C", positive: false, isMacro: false, ticker: companies.find((c) => c.id === companyId)?.ticker });
    }
  };
  const pushPost = (post) => {
    pendingBufferRef.current = [{ ...post, id: post.id || makeId("post"), ts: Date.now() }, ...pendingBufferRef.current].slice(0, 150);
    setPendingCount(pendingBufferRef.current.length);
  };
  const pushPosts = (posts) => {
    if (!posts.length) return;
    pendingBufferRef.current = [...posts, ...pendingBufferRef.current].slice(0, 150);
    setPendingCount(pendingBufferRef.current.length);
  };
  const refreshFeed = () => {
    setFeedPosts((prev) => [...pendingBufferRef.current, ...prev].slice(0, 200));
    pendingBufferRef.current = [];
    setPendingCount(0);
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 400);
  };
  const handleFeedTouchStart = (e) => {
    if (activeTab !== "news") return;
    touchStartYRef.current = e.currentTarget.scrollTop <= 0 ? e.touches[0].clientY : null;
  };
  const handleFeedTouchMove = (e) => {
    if (touchStartYRef.current == null) return;
    const dy = e.touches[0].clientY - touchStartYRef.current;
    if (dy > 0) setPullY(Math.min(90, dy * 0.5));
  };
  const handleFeedTouchEnd = () => {
    if (touchStartYRef.current == null) return;
    if (pullY > 46) refreshFeed();
    setPullY(0);
    touchStartYRef.current = null;
  };
  const applyLoadedData = (data) => {
    setCash(typeof data.cash === "number" ? data.cash : 1e3);
    setOnboarded(typeof data.onboarded === "boolean" ? data.onboarded : true);
    setHoldings(data.holdings || {});
    setIpHoldings(data.ipHoldings || {});
    setPlayerVentureId(data.playerVentureId || null);
    setBonds(Array.isArray(data.bonds) ? data.bonds : []);
    setLeveragedPositions(Array.isArray(data.leveragedPositions) ? data.leveragedPositions : []);
    setResellShops(Array.isArray(data.resellShops) ? data.resellShops.map((s) => {
      if (s.categories) return s;
      const cats = Object.fromEntries(PRODUCT_CATEGORIES.map((c) => [c.id, { stock: 0, avgCost: 0, listedPrice: 0 }]));
      if (s.stock > 0) cats.accessories = { stock: s.stock, avgCost: s.avgCost || 0, listedPrice: s.listedPrice || 0 };
      const { stock, avgCost, listedPrice, ...rest } = s;
      return { ...rest, categories: cats, orders: (s.orders || []).map((o) => o.category ? o : { ...o, category: "accessories" }) };
    }) : []);
    setIpCash(typeof data.ipCash === "number" ? data.ipCash : 0);
    setIpTaxOwed(typeof data.ipTaxOwed === "number" ? data.ipTaxOwed : 0);
    setQuarterRevenue(typeof data.quarterRevenue === "number" ? data.quarterRevenue : 0);
    setQuarterEndsAt(typeof data.quarterEndsAt === "number" ? data.quarterEndsAt : Date.now() + QUARTER_MS);
    setDeclarations(Array.isArray(data.declarations) ? data.declarations : []);
    setIpLoans(Array.isArray(data.ipLoans) ? data.ipLoans : []);
    setMarketIndex(typeof data.marketIndex === "number" ? data.marketIndex : 1);
    setOwnedItems(data.ownedItems || {});
    setLoans(Array.isArray(data.loans) ? data.loans : []);
    setJob(data.job || null);
    setJobHistory(data.jobHistory || {});
    setTaxOwed(typeof data.taxOwed === "number" ? data.taxOwed : 0);
    setTaxHistory(Array.isArray(data.taxHistory) ? data.taxHistory : []);
    setFines(Array.isArray(data.fines) ? data.fines : []);
    setTransactions(Array.isArray(data.transactions) ? data.transactions : []);
    setCardLast4(data.cardLast4 || String(Math.floor(1e3 + Math.random() * 9e3)));
    setSuspicion(typeof data.suspicion === "number" ? data.suspicion : 0);
    setBankRatings(data.bankRatings && typeof data.bankRatings === "object" ? { mfo: 50, priv: 50, fed: 50, ...data.bankRatings } : { mfo: 50, priv: 50, fed: 50 });
    setIpBankRating(typeof data.ipBankRating === "number" ? data.ipBankRating : 50);
    setReputation(typeof data.reputation === "number" ? data.reputation : 100);
    setBankAccounts((() => {
      const raw = data.bankAccounts && typeof data.bankAccounts === "object" ? data.bankAccounts : {};
      const patched = {};
      Object.keys(raw).forEach((bId) => {
        patched[bId] = raw[bId].nextSavingsAt ? raw[bId] : { ...raw[bId], nextSavingsAt: Date.now() + 10 * 60 * 1e3 };
      });
      return patched;
    })());
    setTransferSuspicion(typeof data.transferSuspicion === "number" ? data.transferSuspicion : 0);
    setGreyAccount(data.greyAccount || null);
    setGreyHoldings(data.greyHoldings || {});
    setGreySuspicion(typeof data.greySuspicion === "number" ? data.greySuspicion : 0);
    setBlackMarketVolume(typeof data.blackMarketVolume === "number" ? data.blackMarketVolume : 0);
    setBlackMarketHeat(typeof data.blackMarketHeat === "number" ? data.blackMarketHeat : 0);
    setBlackMarketRoundsDone(typeof data.blackMarketRoundsDone === "number" ? data.blackMarketRoundsDone : 0);
    setBlackMarketRound(data.blackMarketRound || null);
    setMuleCards(data.muleCards && typeof data.muleCards === "object" ? data.muleCards : {});
    setIpTurnoverUsed(typeof data.ipTurnoverUsed === "number" ? data.ipTurnoverUsed : 0);
    setIpTurnoverResetAt(typeof data.ipTurnoverResetAt === "number" ? data.ipTurnoverResetAt : Date.now() + TURNOVER_RESET_MS);
    const REMOVED_TICKERS = ["IRNC", "FTHM", "PXLF", "CBLT"];
    const restoredRaw = (data.companies || []).map((c) => {
      let candles = Array.isArray(c.candles) && c.candles.length >= 2 ? c.candles : seedCandles(c.price, c.vol || 1).candles;
      return {
        ...c,
        candles,
        marketingLevel: c.marketingLevel || 0,
        rdLevel: c.rdLevel || 0,
        hypeLevel: c.hypeLevel || 0,
        scamHeat: c.scamHeat || 0,
        rugged: !!c.rugged
      };
    }).filter((c) => c.isPlayer || !REMOVED_TICKERS.includes(c.ticker));
    const knownTickers = new Set(restoredRaw.map((c) => c.ticker));
    const missingSeeds = seedCompanies().filter((c) => !knownTickers.has(c.ticker));
    const restored = [...restoredRaw, ...missingSeeds];
    setCompanies(restored.length ? restored : seedCompanies());
    engineRef.current = {};
  };
  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get(STORAGE_KEY);
        if (res && res.value) {
          applyLoadedData(JSON.parse(res.value));
        } else {
          setCompanies(seedCompanies());
          setCash(0);
          setOnboarded(false);
        }
      } catch (e) {
        setCompanies(seedCompanies());
        setCash(0);
        setOnboarded(false);
      }
      setFeedPosts([
        { id: makeId("post"), text: "\u0420\u044B\u043D\u043E\u043A \u043E\u0442\u043A\u0440\u044B\u043B\u0441\u044F \u2014 \u043A\u043E\u0442\u0438\u0440\u043E\u0432\u043A\u0438 \u0432 \u0434\u0432\u0438\u0436\u0435\u043D\u0438\u0438", positive: true, isMacro: true },
        { id: makeId("post"), text: "HLXB \u043E\u0442\u0447\u0438\u0442\u0430\u043B\u0441\u044F \u043B\u0443\u0447\u0448\u0435 \u043F\u0440\u043E\u0433\u043D\u043E\u0437\u043E\u0432", positive: true, isMacro: false },
        { id: makeId("post"), text: "\u0410\u043D\u0430\u043B\u0438\u0442\u0438\u043A\u0438 \u0441\u043B\u0435\u0434\u044F\u0442 \u0437\u0430 \u0441\u0435\u043A\u0442\u043E\u0440\u043E\u043C \xAB\u041A\u0440\u0438\u043F\u0442\u043E\xBB", positive: true, isMacro: false }
      ]);
      setLoaded(true);
    })();
  }, []);
  const buildSavePayload = () => ({
    cash: cashRef.current,
    onboarded: onboardedRef.current,
    holdings: holdingsRef.current,
    ipHoldings: ipHoldingsRef.current,
    playerVentureId: playerVentureIdRef.current,
    bonds: bondsRef.current,
    leveragedPositions: leveragedPositionsRef.current,
    resellShops: resellShopsRef.current,
    ipCash: ipCashRef.current,
    ipTaxOwed: ipTaxOwedRef.current,
    quarterRevenue: quarterRevenueRef.current,
    quarterEndsAt: quarterEndsAtRef.current,
    declarations: declarationsRef.current,
    ipLoans: ipLoansRef.current,
    marketIndex: marketIndexRef.current,
    ownedItems: ownedItemsRef.current,
    loans: loansRef.current,
    job: jobRef.current,
    jobHistory: jobHistoryRef.current,
    taxOwed: taxOwedRef.current,
    taxHistory: taxHistoryRef.current,
    fines: finesRef.current,
    transactions: transactionsRef.current,
    cardLast4: cardLast4Ref.current,
    suspicion: suspicionRef.current,
    bankRatings: bankRatingsRef.current,
    ipBankRating: ipBankRatingRef.current,
    reputation: reputationRef.current,
    bankAccounts: bankAccountsRef.current,
    transferSuspicion: transferSuspicionRef.current,
    greyAccount: greyAccountRef.current,
    greyHoldings: greyHoldingsRef.current,
    greySuspicion: greySuspicionRef.current,
    blackMarketVolume: blackMarketVolumeRef.current,
    blackMarketHeat: blackMarketHeatRef.current,
    blackMarketRoundsDone: blackMarketRoundsDoneRef.current,
    blackMarketRound: blackMarketRoundRef.current,
    muleCards: muleCardsRef.current,
    ipTurnoverUsed: ipTurnoverUsedRef.current,
    ipTurnoverResetAt: ipTurnoverResetAtRef.current,
    companies: companiesRef.current.map((c) => ({
      id: c.id,
      name: c.name,
      ticker: c.ticker,
      sector: c.sector,
      price: c.price,
      vol: c.vol,
      supply: c.supply,
      isPlayer: c.isPlayer,
      kind: c.kind,
      strategy: c.strategy,
      marketingLevel: c.marketingLevel,
      rdLevel: c.rdLevel,
      hypeLevel: c.hypeLevel,
      scamHeat: c.scamHeat,
      rugged: c.rugged,
      candles: (c.candles || []).slice(-150)
    }))
  });
  const saveGame = () => {
    window.storage.set(STORAGE_KEY, JSON.stringify(buildSavePayload())).catch(() => {
    });
  };
  const generateExportText = () => {
    try {
      const payload = { ...buildSavePayload(), exportedAt: Date.now(), exportVersion: STORAGE_KEY };
      setExportText(JSON.stringify(payload));
      setImportError(null);
    } catch (e) {
      setImportError("\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0441\u043E\u0431\u0440\u0430\u0442\u044C \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u0435");
    }
  };
  const copyExportText = async () => {
    if (!exportText) return;
    try {
      await navigator.clipboard.writeText(exportText);
      setExportFlash(true);
      setTimeout(() => setExportFlash(false), 1500);
    } catch (e) {
      setImportError("\u041D\u0435 \u043F\u043E\u043B\u0443\u0447\u0438\u043B\u043E\u0441\u044C \u0441\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438 \u2014 \u0432\u044B\u0434\u0435\u043B\u0438 \u0442\u0435\u043A\u0441\u0442 \u043D\u0438\u0436\u0435 \u0432\u0440\u0443\u0447\u043D\u0443\u044E \u0438 \u0441\u043A\u043E\u043F\u0438\u0440\u0443\u0439");
    }
  };
  const importFromText = () => {
    if (!importText.trim()) {
      setImportError("\u0412\u0441\u0442\u0430\u0432\u044C \u0441\u043D\u0430\u0447\u0430\u043B\u0430 \u0442\u0435\u043A\u0441\u0442 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u044F");
      return;
    }
    try {
      const data = JSON.parse(importText.trim());
      applyLoadedData(data);
      setImportError(null);
      setImportText("");
      setTimeout(saveGame, 100);
    } catch (e) {
      setImportError("\u041D\u0435 \u043F\u043E\u043B\u0443\u0447\u0438\u043B\u043E\u0441\u044C \u043F\u0440\u043E\u0447\u0438\u0442\u0430\u0442\u044C \u2014 \u043F\u0440\u043E\u0432\u0435\u0440\u044C, \u0447\u0442\u043E \u0441\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043B \u0442\u0435\u043A\u0441\u0442 \u0446\u0435\u043B\u0438\u043A\u043E\u043C");
    }
  };
  useEffect(() => {
    if (!loaded) return;
    const id = setInterval(saveGame, 12e3);
    return () => clearInterval(id);
  }, [loaded]);
  useEffect(() => {
    if (!loaded) return;
    let rafId;
    let lastFrame = null;
    let lastSync = 0;
    const loop = (ts) => {
      if (lastFrame == null) lastFrame = ts;
      const dt = Math.min(80, ts - lastFrame);
      lastFrame = ts;
      const engine = engineRef.current;
      companiesRef.current.forEach((c) => {
        let e = engine[c.id];
        if (!e) e = engine[c.id] = { price: c.price, cOpen: c.price, cHigh: c.price, cLow: c.price, candleStart: ts };
        let step = gauss() * (c.vol || 1) * 0.035 * Math.sqrt(dt / 16.67);
        if (c.ticker === "TEHER") {
          const pegDeviationPct = (1 - e.price) / e.price * 100;
          step += pegDeviationPct * 0.05;
        }
        e.price = Math.max(0.01, e.price * (1 + step / 100));
        e.cHigh = Math.max(e.cHigh, e.price);
        e.cLow = Math.min(e.cLow, e.price);
        if (ts - e.candleStart >= CANDLE_MS) {
          const finished = { o: e.cOpen, h: e.cHigh, l: e.cLow, c: e.price, t: Date.now() };
          setCompanies((prev) => prev.map((x) => x.id === c.id ? { ...x, candles: [...(x.candles || []).slice(-149), finished] } : x));
          e.cOpen = e.price;
          e.cHigh = e.price;
          e.cLow = e.price;
          e.candleStart = ts;
        }
      });
      if (ts - lastSync > 250) {
        lastSync = ts;
        setCompanies((prev) => prev.map((c) => {
          const e = engine[c.id];
          if (!e) return c;
          return { ...c, price: Number(e.price.toFixed(e.price < 5 ? 4 : 2)) };
        }));
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [loaded]);
  useEffect(() => {
    if (!loaded) return;
    const runNewsTick = () => {
      const newsBatch = [];
      const newRumors = [];
      const resolvingNow = pendingRumorsRef.current.filter((r) => r.remainingTicks <= 1);
      const stillPending = pendingRumorsRef.current.filter((r) => r.remainingTicks > 1).map((r) => ({ ...r, remainingTicks: r.remainingTicks - 1 }));
      resolvingNow.forEach((r) => {
        applyImpact(r.companyId, r.reversalPct);
        newsBatch.push({ id: makeId("news"), text: `\u041D\u043E\u0432\u043E\u0441\u0442\u044C \u043E ${r.ticker} \u043D\u0435 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u043B\u0430\u0441\u044C \u2014 \u0446\u0435\u043D\u0430 \u0447\u0430\u0441\u0442\u0438\u0447\u043D\u043E \u043E\u0442\u044B\u0433\u0440\u0430\u043D\u0430 \u043D\u0430\u0437\u0430\u0434`, positive: r.reversalPct > 0, isMacro: false, ticker: r.ticker });
      });
      if (Math.random() < 0.01) {
        const isCrash = Math.random() < 0.7;
        const list = isCrash ? MACRO_NEWS.crash : MACRO_NEWS.rally;
        const text = list[Math.floor(Math.random() * list.length)];
        const impact = isCrash ? -(18 + Math.random() * 20) : 8 + Math.random() * 10;
        companiesRef.current.forEach((c) => applyImpact(c.id, impact * newsImpactMult(c)));
        newsBatch.push({ id: makeId("news"), text, positive: !isCrash, isMacro: true });
      }
      if (Math.random() < 0.02) {
        const sector = SECTORS[Math.floor(Math.random() * SECTORS.length)];
        const affected = companiesRef.current.filter((c) => c.sector === sector);
        if (affected.length) {
          const isPos = Math.random() < 0.5;
          const impact = isPos ? 5 + Math.random() * 10 : -(5 + Math.random() * 10);
          affected.forEach((c) => applyImpact(c.id, impact * newsImpactMult(c)));
          const text = isPos ? `\u041F\u043E\u0437\u0438\u0442\u0438\u0432\u043D\u044B\u0435 \u0441\u0438\u0433\u043D\u0430\u043B\u044B \u0434\u043B\u044F \u0441\u0435\u043A\u0442\u043E\u0440\u0430 \xAB${sector}\xBB` : `\u0414\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u043D\u0430 \u0432\u0435\u0441\u044C \u0441\u0435\u043A\u0442\u043E\u0440 \xAB${sector}\xBB`;
          newsBatch.push({ id: makeId("news"), text, positive: isPos, isMacro: false });
        }
      }
      companiesRef.current.forEach((c) => {
        if (Math.random() < 0.05) {
          const isPos = Math.random() < 0.5;
          const impact = (isPos ? 4 + Math.random() * 10 : -(4 + Math.random() * 10)) * newsImpactMult(c);
          applyImpact(c.id, impact);
          const templates = isPos ? NEWS.pos : NEWS.neg;
          const text = templates[Math.floor(Math.random() * templates.length)].replace("{t}", c.ticker);
          newsBatch.push({ id: makeId("news"), text, positive: isPos, isMacro: false, ticker: c.ticker });
          if (Math.random() < 0.45) {
            newRumors.push({ companyId: c.id, ticker: c.ticker, remainingTicks: 5 + Math.floor(Math.random() * 4), reversalPct: -impact * 0.7 });
          }
        }
        if (c.isPlayer && c.kind === "crypto" && c.strategy === "scam" && !c.rugged && (c.scamHeat || 0) > 40) {
          const chance = (c.scamHeat - 40) * 3e-3;
          if (Math.random() < chance) {
            applyImpact(c.id, -85 - Math.random() * 10);
            setCompanies((prev) => prev.map((x) => x.id === c.id ? { ...x, rugged: true } : x));
            newsBatch.push({ id: makeId("news"), text: `${c.ticker} \u0440\u0430\u0437\u043E\u0431\u043B\u0430\u0447\u0451\u043D \u043A\u0430\u043A \u0441\u043A\u0430\u043C \u2014 \u0438\u043D\u0432\u0435\u0441\u0442\u043E\u0440\u044B \u0440\u0430\u0437\u043E\u0440\u0435\u043D\u044B`, positive: false, isMacro: false, ticker: c.ticker });
            adjustReputation(-25);
          }
        }
      });
      setPendingRumors([...stillPending, ...newRumors]);
      if (newsBatch.length) pushPosts(newsBatch);
    };
    runNewsTick();
    const id = setInterval(runNewsTick, 4e3);
    return () => clearInterval(id);
  }, [loaded]);
  useEffect(() => {
    if (!loaded) return;
    const id = setInterval(() => {
      const holdingsValue = Object.entries(holdingsRef.current).reduce((sum, [cid, h]) => {
        const c = companiesRef.current.find((x) => x.id === cid);
        return sum + (c ? c.price * h.qty : 0);
      }, 0);
      const ipHoldingsValue2 = Object.entries(ipHoldingsRef.current).reduce((sum, [cid, h]) => {
        const c = companiesRef.current.find((x) => x.id === cid);
        return sum + (c ? c.price * h.qty : 0);
      }, 0);
      const greyHoldingsValue2 = Object.entries(greyHoldingsRef.current).reduce((sum, [cid, h]) => {
        const c = companiesRef.current.find((x) => x.id === cid);
        return sum + (c ? c.price * h.qty : 0);
      }, 0);
      const bankAccountsValue2 = Object.values(bankAccountsRef.current).reduce((sum, a) => sum + a.balance, 0);
      const muleCardsValue2 = Object.values(muleCardsRef.current).reduce((sum, c) => sum + c.balance, 0);
      const greyBalance2 = greyAccountRef.current ? greyAccountRef.current.balance : 0;
      const shopStockValue2 = resellShopsRef.current.reduce((sum, s) => sum + Object.values(s.categories || {}).reduce((cs, c) => cs + c.stock * c.avgCost, 0), 0);
      const itemsValue2 = Object.entries(ownedItemsRef.current).reduce((sum, [itemId, qty]) => {
        const item = SHOP_ITEMS.find((i) => i.id === itemId);
        return sum + (item ? item.price * 0.65 * qty : 0);
      }, 0);
      const leverageValue2 = leveragedPositionsRef.current.reduce((sum, p) => {
        const c = companiesRef.current.find((x) => x.id === p.companyId);
        const price = c ? c.price : p.entryPrice;
        return sum + Math.max(0, p.margin + (price - p.entryPrice) * p.qty);
      }, 0);
      const bondsValue2 = bondsRef.current.reduce((sum, b) => {
        const bank = BANK_ACCOUNTS.find((x) => x.id === b.bankId);
        if (!bank) return sum;
        const elapsed = Math.min(1, (Date.now() - b.boughtAt) / (bank.bond.termSeconds * 1e3));
        return sum + b.principal * (1 + bank.bond.totalReturnPct / 100 * elapsed);
      }, 0);
      const nw = cashRef.current + bankAccountsValue2 + greyBalance2 + greyHoldingsValue2 + muleCardsValue2 + ipCashRef.current + ipHoldingsValue2 + shopStockValue2 + holdingsValue + bondsValue2 + itemsValue2 + leverageValue2;
      setNetWorthHistory((prev) => [...prev.slice(-79), nw]);
    }, 2e3);
    return () => clearInterval(id);
  }, [loaded]);
  useEffect(() => {
    if (!loaded) return;
    const id = setInterval(() => {
      const toSeize = [];
      const updated = loansRef.current.map((l) => {
        let { balance, dueIn, paidThisCycle } = l;
        balance = balance * (1 + l.ratePerTick);
        dueIn -= 5;
        if (dueIn <= 0) {
          if (!paidThisCycle) {
            balance += balance * 0.02;
            adjustReputation(-2);
            adjustBankRating(l.bankId, -8, -2);
          }
          dueIn = DUE_CYCLE_SECONDS;
          paidThisCycle = false;
        }
        const ratio = balance / l.principal;
        const frozen = ratio >= 1.5;
        let seizedRecently = ratio < 1.5 ? false : l.seizedRecently;
        if (ratio >= 1.7 && !l.seizedRecently) {
          seizedRecently = true;
          toSeize.push(l.id);
        }
        return { ...l, balance: Number(balance.toFixed(2)), dueIn, paidThisCycle, frozen, seizedRecently };
      });
      setLoans(updated);
      loansRef.current = updated;
      toSeize.forEach((lid) => {
        seizeForLoan(lid);
        adjustReputation(-15);
      });
    }, 5e3);
    return () => clearInterval(id);
  }, [loaded]);
  useEffect(() => {
    if (!loaded) return;
    const id = setInterval(() => {
      setTaxOverdueSeconds((prev) => {
        if (taxOwedRef.current <= 100) return 0;
        const next = prev + 5;
        if (next >= 600) {
          const penalty = Math.round(taxOwedRef.current * (0.25 + Math.random() * 0.15));
          setFines((prevFines) => [{ id: makeId("fine"), label: "\u041D\u0435\u0443\u043F\u043B\u0430\u0442\u0430 \u043D\u0430\u043B\u043E\u0433\u043E\u0432 \u0441\u0432\u044B\u0448\u0435 10 \u043C\u0438\u043D\u0443\u0442", amount: penalty, paid: false }, ...prevFines].slice(0, 30));
          setTaxHistory((h) => [{ id: makeId("tax"), label: "\u0414\u0435\u043B\u043E \u043E \u043D\u0435\u0443\u043F\u043B\u0430\u0442\u0435 \u043D\u0430\u043B\u043E\u0433\u043E\u0432 \u043F\u0435\u0440\u0435\u0434\u0430\u043D\u043E \u0432 \u0438\u043D\u0441\u043F\u0435\u043A\u0446\u0438\u044E", amount: 0, kind: "penalty" }, ...h].slice(0, 60));
          flagSuspicion(20);
          pushPost({ text: "\u041D\u0430\u043B\u043E\u0433\u043E\u0432\u0430\u044F \u0441\u043B\u0443\u0436\u0431\u0430 \u0437\u0430\u0432\u0435\u043B\u0430 \u0434\u0435\u043B\u043E \u043E \u043D\u0435\u0443\u043F\u043B\u0430\u0442\u0435 \u2014 \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B\u044B \u043F\u0435\u0440\u0435\u0434\u0430\u043D\u044B \u0432 \u0444\u0438\u043D\u0430\u043D\u0441\u043E\u0432\u0443\u044E \u0438\u043D\u0441\u043F\u0435\u043A\u0446\u0438\u044E", positive: false, isMacro: true });
          adjustReputation(-10);
          return 0;
        }
        return next;
      });
    }, 5e3);
    return () => clearInterval(id);
  }, [loaded]);
  useEffect(() => {
    if (!loaded) return;
    const id = setInterval(() => {
      const v = companiesRef.current.find((c) => c.id === playerVentureIdRef.current);
      if (v) {
        const amt = Math.max(1, Math.round(v.price * v.supply * 25e-5));
        setIpCash((c) => Math.max(0, c - amt));
        logTx(`\u041D\u0430\u043B\u043E\u0433 \u043D\u0430 \u0431\u0438\u0437\u043D\u0435\u0441 (${v.ticker})`, amt, "out");
      }
    }, 45e3);
    return () => clearInterval(id);
  }, [loaded]);
  useEffect(() => {
    if (!loaded) return;
    const reasons = [
      "\u041F\u043E\u0434\u043E\u0437\u0440\u0438\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u0441\u0445\u0435\u043C\u0430 \u043F\u0440\u043E\u0434\u0430\u0436 (\u043F\u0430\u043C\u043F-\u0434\u0430\u043C\u043F)",
      "\u0420\u0435\u0437\u043A\u0430\u044F \u043A\u0440\u0443\u043F\u043D\u0430\u044F \u0441\u0434\u0435\u043B\u043A\u0430 \u0431\u0435\u0437 \u044D\u043A\u043E\u043D\u043E\u043C\u0438\u0447\u0435\u0441\u043A\u043E\u0433\u043E \u043E\u0431\u043E\u0441\u043D\u043E\u0432\u0430\u043D\u0438\u044F",
      "\u0412\u044B\u0432\u043E\u0434 \u043A\u0440\u0443\u043F\u043D\u043E\u0439 \u0434\u043E\u043B\u0438 \u0430\u043A\u0442\u0438\u0432\u0430 \u0441\u0440\u0430\u0437\u0443 \u043F\u043E\u0441\u043B\u0435 \u0445\u0430\u0439\u043F-\u043A\u0430\u043C\u043F\u0430\u043D\u0438\u0438",
      "\u041D\u0435\u0442\u0438\u043F\u0438\u0447\u043D\u044B\u0439 \u043E\u0431\u044A\u0451\u043C \u043E\u043F\u0435\u0440\u0430\u0446\u0438\u0439 \u0434\u043B\u044F \u043F\u0440\u043E\u0444\u0438\u043B\u044F \u0438\u043D\u0432\u0435\u0441\u0442\u043E\u0440\u0430"
    ];
    const id = setInterval(() => {
      const s = suspicionRef.current;
      if (s > 25) {
        const chance = Math.min(0.5, (s - 25) * 0.01);
        if (Math.random() < chance) {
          const base = Math.max(cashRef.current, 200);
          const fine = Math.round(base * (0.18 + Math.random() * 0.22));
          if (fine > 0) {
            const reason = reasons[Math.floor(Math.random() * reasons.length)];
            setFines((prev) => [{ id: makeId("fine"), label: reason, amount: fine, paid: false }, ...prev].slice(0, 30));
            pushPost({ id: makeId("news"), text: "\u0424\u0438\u043D\u0430\u043D\u0441\u043E\u0432\u0430\u044F \u0438\u043D\u0441\u043F\u0435\u043A\u0446\u0438\u044F \u0432\u044B\u044F\u0432\u0438\u043B\u0430 \u043F\u043E\u0434\u043E\u0437\u0440\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u043E\u043F\u0435\u0440\u0430\u0446\u0438\u0438 \u0438 \u0432\u044B\u043F\u0438\u0441\u0430\u043B\u0430 \u0448\u0442\u0440\u0430\u0444", positive: false, isMacro: true });
            adjustReputation(-6);
          }
          setSuspicion((v) => v * 0.35);
        } else {
          setSuspicion((v) => Math.max(0, v * 0.9));
        }
      } else {
        setSuspicion((v) => Math.max(0, v * 0.9));
      }
    }, 2e4);
    return () => clearInterval(id);
  }, [loaded]);
  useEffect(() => {
    if (jobCooldown <= 0) return;
    const id = setInterval(() => setJobCooldown((s) => Math.max(0, s - 1)), 1e3);
    return () => clearInterval(id);
  }, [jobCooldown]);
  useEffect(() => {
    if (!loaded) return;
    const id = setInterval(() => {
      setCompanies((prev) => prev.map((c) => c.investorCooldown ? { ...c, investorCooldown: Math.max(0, c.investorCooldown - 1) } : c));
    }, 1e3);
    return () => clearInterval(id);
  }, [loaded]);
  useEffect(() => {
    if (!loaded) return;
    const id = setInterval(() => {
      const positions = leveragedPositionsRef.current;
      if (!positions.length) return;
      const toLiquidate = [];
      positions.forEach((p) => {
        const e = engineRef.current[p.companyId];
        const price = e ? e.price : companiesRef.current.find((c) => c.id === p.companyId)?.price;
        if (price != null && price <= p.liquidationPrice) toLiquidate.push(p);
      });
      if (toLiquidate.length) {
        const ids = toLiquidate.map((p) => p.id);
        setLeveragedPositions((prev) => prev.filter((p) => !ids.includes(p.id)));
        toLiquidate.forEach((p) => {
          pushPost({ text: `\u041F\u043E\u0437\u0438\u0446\u0438\u044F ${p.ticker} \u0441 \u043F\u043B\u0435\u0447\u043E\u043C \xD7${p.leverage} \u043B\u0438\u043A\u0432\u0438\u0434\u0438\u0440\u043E\u0432\u0430\u043D\u0430 \u2014 \u043C\u0430\u0440\u0436\u0430 \u043F\u043E\u0442\u0435\u0440\u044F\u043D\u0430 \u043F\u043E\u043B\u043D\u043E\u0441\u0442\u044C\u044E`, positive: false, isMacro: true, ticker: p.ticker });
        });
        setTimeout(saveGame, 50);
      }
    }, 1e3);
    return () => clearInterval(id);
  }, [loaded]);
  useEffect(() => {
    const v = companies.find((c) => c.id === playerVentureId);
    if (v && !v.rugged && (v.investorCooldown || 0) === 0 && !investorPersona) {
      setInvestorPersona(INVESTOR_PERSONAS[Math.floor(Math.random() * INVESTOR_PERSONAS.length)]);
    }
  }, [companies, playerVentureId, investorPersona]);
  useEffect(() => {
    const validIds = [...playerVentureId ? ["venture"] : [], ...resellShops.map((s) => s.id)];
    if (selectedBizId !== null && !validIds.includes(selectedBizId)) {
      setSelectedBizId(validIds[0] || null);
    }
  }, [playerVentureId, resellShops, selectedBizId]);
  useEffect(() => {
    if (!loaded) return;
    const id = setInterval(() => {
      const shops = resellShopsRef.current;
      if (!shops.length) return;
      let changed = false;
      const updated = shops.map((shop) => {
        const arrived = shop.orders.filter((o) => o.status === "shipping" && Date.now() >= o.arrivesAt);
        if (!arrived.length) return shop;
        changed = true;
        let next = shop;
        arrived.forEach((o) => {
          if (o.foreign) {
            next = { ...next, orders: next.orders.map((x) => x.id === o.id ? { ...x, status: "customs" } : x) };
          } else {
            next = foldOrderIntoShop(next, o);
          }
        });
        return next;
      });
      if (changed) {
        setResellShops(updated);
        setTimeout(saveGame, 50);
      }
    }, 1e3);
    return () => clearInterval(id);
  }, [loaded]);
  useEffect(() => {
    if (!loaded) return;
    const id = setInterval(() => {
      const shops = resellShopsRef.current;
      if (!shops.length) return;
      shops.forEach((shop) => {
        const cats = shop.categories || {};
        PRODUCT_CATEGORIES.forEach((cat) => {
          const c = cats[cat.id];
          if (!c || c.stock <= 0 || !c.listedPrice) return;
          const fairPrice = c.avgCost * 1.5 * cat.marginMult * marketIndexRef.current;
          const attractiveness = fairPrice / c.listedPrice;
          const ratingMult = Math.max(0.15, (shop.rating - 1) / 4);
          const repMult = Math.max(0.4, reputationRef.current / 100);
          const activeAds = (shop.ads || []).filter((a) => Date.now() < a.until);
          const adMult = activeAds.length ? Math.min(6, activeAds.reduce((m, a) => m * a.boostMult, 1)) : 1;
          const saleChance = Math.min(0.7, Math.max(0.02, 0.16 * attractiveness * ratingMult * adMult * repMult));
          if (Math.random() < saleChance) {
            const qtySold = Math.min(c.stock, 1 + Math.floor(Math.random() * 3));
            const grossRevenue = c.listedPrice * qtySold;
            const fee = Math.round(grossRevenue * MARKETPLACE_FEE);
            const netRevenue = grossRevenue - fee;
            const positive = Math.random() < shop.qualityScore;
            const newRating = Math.max(1, Math.min(5, shop.rating * 0.9 + (positive ? 5 : 1.8) * 0.1));
            setIpCash((cur) => cur + netRevenue);
            setQuarterRevenue((r) => r + netRevenue);
            trackIpTurnover(netRevenue);
            setResellShops((prev) => prev.map((s) => s.id === shop.id ? {
              ...s,
              categories: { ...s.categories, [cat.id]: { ...s.categories[cat.id], stock: s.categories[cat.id].stock - qtySold } },
              totalRevenue: s.totalRevenue + netRevenue,
              totalUnitsSold: s.totalUnitsSold + qtySold,
              rating: newRating,
              reviews: [{ id: makeId("rev"), positive }, ...s.reviews].slice(0, 8)
            } : s));
            logTx(`\u041F\u0440\u043E\u0434\u0430\u0436\u0430 \u0432 \u043C\u0430\u0433\u0430\u0437\u0438\u043D\u0435 \xAB${shop.name}\xBB \xB7 ${cat.name} \xD7${qtySold}`, netRevenue, "in");
            setTimeout(saveGame, 50);
          }
        });
      });
    }, 4e3);
    return () => clearInterval(id);
  }, [loaded]);
  useEffect(() => {
    if (!loaded) return;
    const id = setInterval(() => {
      setMarketIndex((idx) => Math.max(0.7, Math.min(1.5, idx * (1 + (Math.random() - 0.5) * 0.2))));
    }, MARKET_INDEX_MS);
    return () => clearInterval(id);
  }, [loaded]);
  useEffect(() => {
    if (!loaded) return;
    const id = setInterval(() => {
      if (Date.now() < quarterEndsAtRef.current) return;
      const revenue = quarterRevenueRef.current;
      if (revenue > 0) {
        setDeclarations((prev) => [{ id: makeId("decl"), revenue, tax: Math.round(revenue * IP_TAX_RATE), paid: false, filedAt: Date.now(), dueAt: Date.now() + QUARTER_MS, penalized: false }, ...prev].slice(0, 12));
      }
      setQuarterRevenue(0);
      setQuarterEndsAt(Date.now() + QUARTER_MS);
    }, 5e3);
    return () => clearInterval(id);
  }, [loaded]);
  useEffect(() => {
    if (!loaded) return;
    const id = setInterval(() => {
      setDeclarations((prev) => prev.map((d) => {
        if (!d.paid && !d.penalized && Date.now() >= d.dueAt) {
          flagSuspicion(15);
          adjustReputation(-8);
          return { ...d, tax: Math.round(d.tax * 1.3), penalized: true };
        }
        return d;
      }));
    }, 5e3);
    return () => clearInterval(id);
  }, [loaded]);
  useEffect(() => {
    if (!loaded) return;
    const id = setInterval(() => {
      const toSeize = [];
      const updated = ipLoansRef.current.map((l) => {
        let { balance, dueIn, paidThisCycle } = l;
        balance = balance * (1 + l.ratePerTick);
        dueIn -= 5;
        if (dueIn <= 0) {
          if (!paidThisCycle) {
            balance += balance * 0.02;
            adjustReputation(-2);
            adjustIpBankRating(-8, -2);
          }
          dueIn = DUE_CYCLE_SECONDS;
          paidThisCycle = false;
        }
        const ratio = balance / l.principal;
        const frozen = ratio >= 1.5;
        let seizedRecently = ratio < 1.5 ? false : l.seizedRecently;
        if (ratio >= 1.7 && !l.seizedRecently) {
          seizedRecently = true;
          toSeize.push(l.id);
        }
        return { ...l, balance: Number(balance.toFixed(2)), dueIn, paidThisCycle, frozen, seizedRecently };
      });
      setIpLoans(updated);
      ipLoansRef.current = updated;
      toSeize.forEach((lid) => {
        const loan = ipLoansRef.current.find((l) => l.id === lid);
        if (!loan) return;
        const stockValue = resellShopsRef.current.reduce((sum, s) => sum + Object.values(s.categories || {}).reduce((cs, c) => cs + c.stock * c.avgCost, 0), 0);
        const recovered = Math.min(stockValue + ipCashRef.current, loan.balance);
        setResellShops((prev) => prev.map((s) => ({ ...s, categories: Object.fromEntries(PRODUCT_CATEGORIES.map((c) => [c.id, { stock: 0, avgCost: 0, listedPrice: 0 }])) })));
        setIpCash((c) => Math.max(0, c - recovered));
        setIpLoans((prev) => prev.filter((x) => x.id !== lid));
        pushPost({ text: "\u0411\u0438\u0437\u043D\u0435\u0441\u041A\u0440\u0435\u0434\u0438\u0442 \u0438\u0437\u044A\u044F\u043B \u0442\u043E\u0432\u0430\u0440 \u0441\u043E \u0441\u043A\u043B\u0430\u0434\u0430 \u0432 \u0441\u0447\u0451\u0442 \u0434\u043E\u043B\u0433\u0430 \u2014 \u043B\u0438\u0447\u043D\u044B\u0435 \u0441\u0440\u0435\u0434\u0441\u0442\u0432\u0430 \u043D\u0435 \u0442\u0440\u043E\u043D\u0443\u0442\u044B", positive: false, isMacro: true });
        adjustReputation(-15);
        adjustIpBankRating(-30, -10);
      });
      if (toSeize.length) setTimeout(saveGame, 50);
    }, 5e3);
    return () => clearInterval(id);
  }, [loaded]);
  useEffect(() => {
    if (!loaded) return;
    const id = setInterval(() => {
      setBankAccounts((prev) => {
        let changed = false;
        const next = { ...prev };
        Object.keys(next).forEach((bId) => {
          let acct = next[bId];
          const bankCfg = BANK_ACCOUNTS.find((b) => b.id === bId);
          if (Date.now() >= acct.turnoverResetAt) {
            acct = { ...acct, turnoverUsed: 0, turnoverResetAt: Date.now() + TURNOVER_RESET_MS };
            changed = true;
          }
          if (acct.frozen && acct.frozenUntil && Date.now() >= acct.frozenUntil) {
            acct = { ...acct, frozen: false, frozenUntil: null };
            changed = true;
          }
          if (bankCfg && acct.balance > 0 && acct.nextSavingsAt && Date.now() >= acct.nextSavingsAt) {
            acct = { ...acct, balance: Math.round(acct.balance * (1 + bankCfg.savingsRate) * 100) / 100, nextSavingsAt: Date.now() + bankCfg.savingsIntervalMs };
            changed = true;
          }
          next[bId] = acct;
        });
        return changed ? next : prev;
      });
      if (Date.now() >= ipTurnoverResetAtRef.current) {
        setIpTurnoverUsed(0);
        setIpTurnoverResetAt(Date.now() + TURNOVER_RESET_MS);
      }
    }, 1e4);
    return () => clearInterval(id);
  }, [loaded]);
  useEffect(() => {
    if (!loaded) return;
    const id = setInterval(() => {
      const s = transferSuspicionRef.current;
      if (s > 30) {
        const chance = Math.min(0.4, (s - 30) * 0.01);
        const bId = lastLargeTransferBankRef.current;
        if (Math.random() < chance && bId && bankAccountsRef.current[bId] && !bankAccountsRef.current[bId].frozen) {
          setBankAccounts((prev) => prev[bId] ? { ...prev, [bId]: { ...prev[bId], frozen: true, frozenUntil: Date.now() + FREEZE_DURATION_MS } } : prev);
          const bank = BANK_ACCOUNTS.find((b) => b.id === bId);
          pushPost({ text: `${bank?.name || "\u0411\u0430\u043D\u043A"} \u043F\u0440\u0438\u043E\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u043B \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u044B \u043F\u043E \u0441\u0447\u0451\u0442\u0443 \u2014 \u0441\u043B\u0443\u0436\u0431\u0430 \u0444\u0438\u043D\u043C\u043E\u043D\u0438\u0442\u043E\u0440\u0438\u043D\u0433\u0430 \u043D\u0430\u0447\u0430\u043B\u0430 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0443 \u043E\u043F\u0435\u0440\u0430\u0446\u0438\u0439`, positive: false, isMacro: true });
          flagSuspicion(15);
          setTransferSuspicion((v) => v * 0.3);
          setTimeout(saveGame, 50);
        } else {
          setTransferSuspicion((v) => Math.max(0, v * 0.92));
        }
      } else {
        setTransferSuspicion((v) => Math.max(0, v * 0.92));
      }
    }, 15e3);
    return () => clearInterval(id);
  }, [loaded]);
  useEffect(() => {
    if (!loaded) return;
    const id = setInterval(() => {
      setGreyAccount((acct) => {
        if (!acct) return acct;
        let next = acct;
        const arrived = (acct.pendingTransfers || []).filter((p) => Date.now() >= p.arrivesAt);
        if (arrived.length) {
          const sum = arrived.reduce((s, p) => s + p.amount, 0);
          next = { ...next, balance: next.balance + sum, pendingTransfers: next.pendingTransfers.filter((p) => Date.now() < p.arrivesAt) };
        }
        if (next.frozen && next.frozenUntil && Date.now() >= next.frozenUntil) {
          next = { ...next, frozen: false, frozenUntil: null };
        }
        return next === acct ? acct : next;
      });
    }, 5e3);
    return () => clearInterval(id);
  }, [loaded]);
  useEffect(() => {
    if (!loaded) return;
    const id = setInterval(() => {
      setGreyAccount((acct) => {
        if (!acct || acct.balance <= 0) return acct;
        if (Date.now() < acct.nextSavingsAt) return acct;
        return { ...acct, balance: Math.round(acct.balance * (1 + GREY_BANK.savingsRate) * 100) / 100, nextSavingsAt: Date.now() + GREY_BANK.savingsIntervalMs };
      });
    }, 15e3);
    return () => clearInterval(id);
  }, [loaded]);
  useEffect(() => {
    if (!loaded) return;
    const id = setInterval(() => {
      const s = greySuspicionRef.current;
      if (s > 20) {
        const chance = Math.min(0.35, (s - 20) * 0.012);
        if (Math.random() < chance && greyAccountRef.current && !greyAccountRef.current.frozen) {
          const acct = greyAccountRef.current;
          const fine = Math.round(acct.balance * (0.2 + Math.random() * 0.15));
          setGreyAccount((prev) => prev ? { ...prev, frozen: true, frozenUntil: Date.now() + GREY_BANK.freezeDurationMs } : prev);
          if (fine > 0) setFines((prev) => [{ id: makeId("fine"), label: "Meridian Offshore: \u0437\u0430\u043F\u0440\u043E\u0441 \u043D\u0430 \u043E\u0431\u044A\u044F\u0441\u043D\u0435\u043D\u0438\u0435 \u043F\u0440\u043E\u0438\u0441\u0445\u043E\u0436\u0434\u0435\u043D\u0438\u044F \u0441\u0440\u0435\u0434\u0441\u0442\u0432", amount: fine, paid: false }, ...prev].slice(0, 30));
          pushPost({ text: "\u0424\u0438\u043D\u043C\u043E\u043D\u0438\u0442\u043E\u0440\u0438\u043D\u0433 \u043D\u0430\u043F\u0440\u0430\u0432\u0438\u043B \u0437\u0430\u043F\u0440\u043E\u0441 \u0438\u043D\u043E\u0441\u0442\u0440\u0430\u043D\u043D\u043E\u043C\u0443 \u0431\u0430\u043D\u043A\u0443 \u2014 \u043E\u043F\u0435\u0440\u0430\u0446\u0438\u0438 \u043F\u043E \u043E\u0444\u0448\u043E\u0440\u043D\u043E\u043C\u0443 \u0441\u0447\u0451\u0442\u0443 \u043F\u0440\u0438\u043E\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u044B \u0434\u043E \u043E\u0431\u044A\u044F\u0441\u043D\u0435\u043D\u0438\u0439", positive: false, isMacro: true });
          adjustReputation(-20);
          flagSuspicion(25);
          setGreySuspicion((v) => v * 0.25);
          setTimeout(saveGame, 50);
        } else {
          setGreySuspicion((v) => Math.max(0, v * 0.95));
        }
      } else {
        setGreySuspicion((v) => Math.max(0, v * 0.95));
      }
    }, 2e4);
    return () => clearInterval(id);
  }, [loaded]);
  const triggerBlackMarketBust = (reasonText) => {
    const volume = Math.round(blackMarketVolumeRef.current);
    if (volume > 0) {
      setFines((prev) => [{ id: makeId("fine"), label: "\u0424\u0438\u043D\u043C\u043E\u043D\u0438\u0442\u043E\u0440\u0438\u043D\u0433: \u043D\u0435\u0437\u0430\u043A\u043E\u043D\u043D\u044B\u0439 \u043E\u0431\u043E\u0440\u043E\u0442 \u0447\u0435\u0440\u0435\u0437 \u043F\u0440\u0438\u0451\u043C \u043F\u043B\u0430\u0442\u0435\u0436\u0435\u0439", amount: volume, paid: false }, ...prev].slice(0, 30));
    }
    setBankAccounts((prev) => {
      const next = {};
      Object.keys(prev).forEach((bId) => {
        next[bId] = { ...prev[bId], frozen: true, frozenUntil: Date.now() + BLACKMARKET_FREEZE_MS };
      });
      return next;
    });
    setGreyAccount((a) => a ? { ...a, frozen: true, frozenUntil: Date.now() + BLACKMARKET_FREEZE_MS } : a);
    pushPost({ text: reasonText || "\u0424\u0438\u043D\u043C\u043E\u043D\u0438\u0442\u043E\u0440\u0438\u043D\u0433 \u0432\u0441\u043A\u0440\u044B\u043B \u0441\u0445\u0435\u043C\u0443 \u043F\u0440\u0438\u0451\u043C\u0430 \u043F\u043B\u0430\u0442\u0435\u0436\u0435\u0439 \u2014 \u0432\u0441\u0435 \u0441\u0447\u0435\u0442\u0430 \u0437\u0430\u043C\u043E\u0440\u043E\u0436\u0435\u043D\u044B, \u0448\u0442\u0440\u0430\u0444 \u0432\u044B\u043F\u0438\u0441\u0430\u043D \u043D\u0430 \u0432\u0441\u044E \u043F\u0440\u043E\u0448\u0435\u0434\u0448\u0443\u044E \u0447\u0435\u0440\u0435\u0437 \u043D\u0438\u0445 \u0441\u0443\u043C\u043C\u0443", positive: false, isMacro: true });
    adjustReputation(-35);
    flagSuspicion(40);
    setBlackMarketVolume(0);
    setBlackMarketHeat(0);
    setTimeout(saveGame, 50);
  };
  useEffect(() => {
    if (!loaded) return;
    const id = setInterval(() => {
      const heat = blackMarketHeatRef.current;
      if (heat > BLACKMARKET_HEAT_THRESHOLD) {
        const chance = Math.min(0.4, (heat - BLACKMARKET_HEAT_THRESHOLD) * 0.015);
        if (Math.random() < chance) {
          triggerBlackMarketBust();
        } else {
          setBlackMarketHeat((h) => Math.max(0, h * 0.9));
        }
      } else {
        setBlackMarketHeat((h) => Math.max(0, h * 0.95));
      }
    }, 2e4);
    return () => clearInterval(id);
  }, [loaded]);
  useEffect(() => {
    if (!loaded) return;
    const id = setInterval(() => {
      const r = blackMarketRoundRef.current;
      if (!r || r.stage === "offered" || !r.deadlineAt || Date.now() < r.deadlineAt) return;
      if (r.stage === "received") {
        if (r.accountId === "personal") setCash((c) => Math.max(0, c - r.amount));
        else if (r.accountId === "grey") setGreyAccount((a) => a ? { ...a, balance: Math.max(0, a.balance - r.amount) } : a);
        else if (r.accountId === "ip") setIpCash((c) => Math.max(0, c - r.amount));
        else setBankAccounts((prev) => prev[r.accountId] ? { ...prev, [r.accountId]: { ...prev[r.accountId], balance: Math.max(0, prev[r.accountId].balance - r.amount) } } : prev);
      }
      setBlackMarketHeat((h) => Math.min(200, h + 25));
      pushPost({ text: "\u041D\u0435 \u0443\u0441\u043F\u0435\u043B \u0437\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u044C \u043F\u0440\u0438\u0451\u043C \u0432\u043E\u0432\u0440\u0435\u043C\u044F \u2014 \u0434\u0435\u043D\u044C\u0433\u0438 \u0437\u0430\u0431\u0440\u0430\u043B\u0438 \u043E\u0431\u0440\u0430\u0442\u043D\u043E, \u043A\u0443\u0440\u044C\u0435\u0440 \u043D\u0435\u0434\u043E\u0432\u043E\u043B\u0435\u043D", positive: false, isMacro: true });
      adjustReputation(-8);
      setBlackMarketRound(null);
      setTimeout(saveGame, 50);
    }, 1e4);
    return () => clearInterval(id);
  }, [loaded]);
  useEffect(() => {
    if (!loaded) return;
    const id = setInterval(() => {
      const cards = muleCardsRef.current;
      const ids = Object.keys(cards);
      if (!ids.length) return;
      let changed = false;
      const next = { ...cards };
      ids.forEach((mId) => {
        const card = next[mId];
        if (card.frozen || card.balance <= 0 || !card.nextTheftCheckAt || Date.now() < card.nextTheftCheckAt) return;
        changed = true;
        if (Math.random() < MULE_THEFT_CHANCE) {
          const bank = BANK_ACCOUNTS.find((b) => b.id === card.bankId);
          pushPost({ text: `\u041F\u0440\u043E\u0434\u0430\u0432\u0435\u0446 \u043A\u0430\u0440\u0442\u044B \xAB${bank?.name || "\u0431\u0430\u043D\u043A\u0430"}\xBB \u0432\u044B\u0432\u0435\u043B \u043E\u0441\u0442\u0430\u0442\u043E\u043A \u0441\u0435\u0431\u0435 \u2014 ${fmt(card.balance)} \u043F\u043E\u0442\u0435\u0440\u044F\u043D\u043E`, positive: false, isMacro: false });
          next[mId] = { ...card, balance: 0, nextTheftCheckAt: Date.now() + MULE_THEFT_CHECK_MS };
        } else {
          next[mId] = { ...card, nextTheftCheckAt: Date.now() + MULE_THEFT_CHECK_MS };
        }
      });
      if (changed) {
        setMuleCards(next);
        setTimeout(saveGame, 50);
      }
    }, 15e3);
    return () => clearInterval(id);
  }, [loaded]);
  useEffect(() => {
    if (!loaded) return;
    const id = setInterval(() => {
      const shops = resellShopsRef.current;
      const due = shops.filter((s) => s.offlineStore && Date.now() >= s.offlineStore.nextTickAt);
      if (!due.length) return;
      let ipCashDelta = 0;
      const updates = {};
      due.forEach((shop) => {
        const os = shop.offlineStore;
        const tier = OFFLINE_STORE_TIERS[os.tier];
        const extra = Math.round(tier.extraMin + Math.random() * (tier.extraMax - tier.extraMin));
        const totalCost = tier.rent + tier.salary + tier.electricity + extra;
        const available = ipCashRef.current + ipCashDelta;
        let missedTicks = os.missedTicks;
        let boostHealth = os.boostHealth;
        let paidCost;
        if (available >= totalCost) {
          paidCost = totalCost;
          missedTicks = 0;
        } else {
          paidCost = Math.max(0, available);
          boostHealth = Math.max(0, boostHealth - 30);
          missedTicks += 1;
        }
        ipCashDelta -= paidCost;
        logTx(`\u0420\u0430\u0441\u0445\u043E\u0434\u044B \u043E\u0444\u043B\u0430\u0439\u043D-\u043C\u0430\u0433\u0430\u0437\u0438\u043D\u0430 \xAB${shop.name}\xBB (\u0430\u0440\u0435\u043D\u0434\u0430/\u0437\u0430\u0440\u043F\u043B\u0430\u0442\u0430/\u044D\u043B\u0435\u043A\u0442\u0440\u0438\u0447\u0435\u0441\u0442\u0432\u043E/\u0434\u043E\u043F.)`, paidCost, "out");
        if (missedTicks >= 3) {
          updates[shop.id] = { offlineStore: null };
          pushPost({ text: `\u041E\u0444\u043B\u0430\u0439\u043D-\u043C\u0430\u0433\u0430\u0437\u0438\u043D \xAB${shop.name}\xBB \u0437\u0430\u043A\u0440\u044B\u043B\u0441\u044F \u2014 \u043D\u0435 \u043F\u043E\u0442\u044F\u043D\u0443\u043B \u0440\u0430\u0441\u0445\u043E\u0434\u044B`, positive: false, isMacro: false });
          return;
        }
        const cats = shop.categories || {};
        const catValues = PRODUCT_CATEGORIES.map((cat) => {
          const c = cats[cat.id];
          if (!c) return { cat, value: 0, stock: 0 };
          const price = c.listedPrice > 0 ? c.listedPrice : c.avgCost * 1.5 * cat.marginMult;
          return { cat, value: c.stock * price, stock: c.stock };
        });
        const totalStockValue = catValues.reduce((s, x) => s + x.value, 0);
        const adActive = os.tickCount < os.adUntilTick;
        const effectiveBoost = Math.min(OFFLINE_MAX_BOOST, 1 + boostHealth / 100 * (OFFLINE_BASE_BOOST - 1) + (adActive ? 3 : 0));
        const saleFraction = Math.min(0.9, effectiveBoost / OFFLINE_BASE_BOOST * tier.baseFraction);
        const revenue = Math.round(totalStockValue * saleFraction);
        const newCategories = { ...cats };
        catValues.forEach(({ cat, stock }) => {
          if (stock > 0) {
            const sold = Math.min(stock, Math.round(stock * saleFraction));
            newCategories[cat.id] = { ...newCategories[cat.id], stock: newCategories[cat.id].stock - sold };
          }
        });
        if (totalStockValue >= tier.wellStockedValue) boostHealth = Math.min(100, boostHealth + 8);
        else if (totalStockValue > 0) boostHealth = Math.max(0, boostHealth - 3);
        else boostHealth = Math.max(0, boostHealth - 15);
        if (revenue > 0) {
          ipCashDelta += revenue;
          setQuarterRevenue((r) => r + revenue);
          trackIpTurnover(revenue);
          logTx(`\u041E\u0444\u043B\u0430\u0439\u043D-\u043F\u0440\u043E\u0434\u0430\u0436\u0438 \xB7 \xAB${shop.name}\xBB`, revenue, "in");
        }
        updates[shop.id] = {
          categories: newCategories,
          totalRevenue: shop.totalRevenue + revenue,
          offlineStore: { ...os, boostHealth, missedTicks, tickCount: os.tickCount + 1, nextTickAt: Date.now() + OFFLINE_TICK_MS, totalOfflineRevenue: os.totalOfflineRevenue + revenue }
        };
      });
      if (ipCashDelta !== 0) setIpCash((c) => Math.max(0, c + ipCashDelta));
      setResellShops((prev) => prev.map((s) => updates[s.id] ? { ...s, ...updates[s.id] } : s));
      setTimeout(saveGame, 50);
    }, 15e3);
    return () => clearInterval(id);
  }, [loaded]);
  const executeTrade = (companyId, side, qty, account = "personal") => {
    const company = companies.find((c) => c.id === companyId);
    if (!company || qty <= 0) return;
    const useIp = account === "ip" && company.sector === "\u041A\u0440\u0438\u043F\u0442\u043E";
    const useGrey = account === "grey" && greyAccount && !greyAccount.frozen;
    const useBankCard = !useIp && !useGrey && BANK_ACCOUNTS.some((b) => b.id === account) && bankAccounts[account] && !bankAccounts[account].frozen;
    const useMule = !useIp && !useGrey && !useBankCard && muleCards[account] && !muleCards[account].frozen;
    if (side === "sell" && !useIp && !useGrey && !useBankCard && !useMule && loans.some((l) => l.frozen)) return;
    const curCash = useGrey ? greyAccount.balance : useIp ? ipCash : useBankCard ? bankAccounts[account].balance : useMule ? muleCards[account].balance : cash;
    const curHoldings = useGrey ? greyHoldings : useIp ? ipHoldings : holdings;
    const setCurCash = useGrey ? (fn) => setGreyAccount((a) => a ? { ...a, balance: typeof fn === "function" ? fn(a.balance) : fn } : a) : useIp ? setIpCash : useBankCard ? (fn) => setBankAccounts((prev) => prev[account] ? { ...prev, [account]: { ...prev[account], balance: typeof fn === "function" ? fn(prev[account].balance) : fn } } : prev) : useMule ? (fn) => setMuleCards((prev) => prev[account] ? { ...prev, [account]: { ...prev[account], balance: typeof fn === "function" ? fn(prev[account].balance) : fn } } : prev) : setCash;
    const setCurHoldings = useGrey ? setGreyHoldings : useIp ? setIpHoldings : setHoldings;
    const acctTag = useGrey ? " \xB7 Meridian" : useIp ? " \xB7 \u0418\u041F" : useBankCard ? ` \xB7 ${BANK_ACCOUNTS.find((b) => b.id === account)?.name}` : useMule ? " \xB7 \u0447\u0443\u0436\u0430\u044F \u043A\u0430\u0440\u0442\u0430" : "";
    const sizeRatio = qty / company.supply;
    const impactPct = Math.min(92, sizeRatio * 150);
    if (side === "buy") {
      const avgExecPrice = company.price * (1 + impactPct / 200);
      const cost = avgExecPrice * qty * 1.002 * (useGrey ? 1 + GREY_BANK.tradeBuyFee : 1);
      if (cost > curCash) return;
      setCurCash((c) => c - cost);
      if (useBankCard) {
        setBankAccounts((prev) => prev[account] ? { ...prev, [account]: { ...prev[account], turnoverUsed: prev[account].turnoverUsed + cost, lifetimeTurnover: (prev[account].lifetimeTurnover || 0) + cost } } : prev);
      } else if (useMule) {
        setMuleCards((prev) => prev[account] ? { ...prev, [account]: { ...prev[account], turnoverUsed: prev[account].turnoverUsed + cost, lifetimeTurnover: prev[account].lifetimeTurnover + cost } } : prev);
      }
      setCurHoldings((h) => {
        const prevH = h[companyId] || { qty: 0, avgCost: 0 };
        const newQty = prevH.qty + qty;
        const newAvg = (prevH.avgCost * prevH.qty + avgExecPrice * qty) / newQty;
        return { ...h, [companyId]: { qty: newQty, avgCost: newAvg } };
      });
      applyImpact(companyId, impactPct);
      if (!useMule && sizeRatio > 0.08) flagSuspicion(sizeRatio * 35);
      logTx(`\u041F\u043E\u043A\u0443\u043F\u043A\u0430 ${company.ticker} \xD7${qty}${acctTag}`, cost, "out");
    } else {
      const held = curHoldings[companyId]?.qty || 0;
      if (qty > held) return;
      const avgCost = curHoldings[companyId].avgCost;
      const avgExecPrice = company.price * (1 - impactPct / 200);
      const grossProceeds = avgExecPrice * qty * 0.998 * (useGrey ? 1 - GREY_BANK.tradeSellFee : 1);
      const profit = (avgExecPrice - avgCost) * qty;
      setCurCash((c) => c + grossProceeds);
      setCurHoldings((h) => {
        const prevH = h[companyId];
        const newQty = prevH.qty - qty;
        if (newQty <= 0) {
          const rest = { ...h };
          delete rest[companyId];
          return rest;
        }
        return { ...h, [companyId]: { ...prevH, qty: newQty } };
      });
      applyImpact(companyId, -impactPct);
      if (useIp) {
        setQuarterRevenue((r) => r + grossProceeds);
        trackIpTurnover(grossProceeds);
      } else if (!useGrey && profit > 0) {
        accrueTax(`\u041D\u0430\u043B\u043E\u0433 \u0441 \u043F\u0440\u0438\u0431\u044B\u043B\u0438 (${company.ticker})`, Math.round(profit * 0.13));
      }
      logTx(`\u041F\u0440\u043E\u0434\u0430\u0436\u0430 ${company.ticker} \xD7${qty}${acctTag}`, grossProceeds, "in");
      if (useMule) {
      } else if (companyId === playerVentureId && sizeRatio > 0.05) {
        const recentPump = Date.now() - lastPumpAtRef.current < 12e4;
        flagSuspicion(sizeRatio * 55 + (recentPump ? 20 : 0));
      } else if (sizeRatio > 0.08) {
        flagSuspicion(sizeRatio * 28);
      }
    }
    setTimeout(saveGame, 50);
  };
  const openLeveragedPosition = (companyId, qty, leverage, account = "personal") => {
    const company = companies.find((c) => c.id === companyId);
    if (!company || qty <= 0 || leverage <= 1) return;
    const useBankCard = account !== "personal" && BANK_ACCOUNTS.some((b) => b.id === account) && bankAccounts[account] && !bankAccounts[account].frozen;
    const sizeRatio = qty / company.supply;
    const impactPct = Math.min(92, sizeRatio * 150);
    const avgExecPrice = company.price * (1 + impactPct / 200);
    const notional = avgExecPrice * qty;
    const margin = notional / leverage;
    const curCash = useBankCard ? bankAccounts[account].balance : cash;
    if (margin > curCash) return;
    const liquidationPrice = avgExecPrice * (1 - 0.9 / leverage);
    const fundedBy = useBankCard ? account : "personal";
    adjustAccountBalance(fundedBy, -margin);
    setLeveragedPositions((prev) => [...prev, {
      id: makeId("lev"),
      companyId,
      ticker: company.ticker,
      qty,
      entryPrice: avgExecPrice,
      leverage,
      margin,
      liquidationPrice,
      account: fundedBy
    }]);
    logTx(`\u041E\u0442\u043A\u0440\u044B\u0442\u0438\u0435 \u043F\u043E\u0437\u0438\u0446\u0438\u0438 ${company.ticker} \xD7${leverage}${useBankCard ? ` \xB7 ${BANK_ACCOUNTS.find((b) => b.id === account)?.name}` : ""}`, margin, "out");
    applyImpact(companyId, impactPct);
    if (sizeRatio > 0.08) flagSuspicion(sizeRatio * 35);
    if (companyId === playerVentureId && sizeRatio > 0.05) flagSuspicion(sizeRatio * 40);
    setTimeout(saveGame, 50);
  };
  const closeLeveragedPosition = (positionId) => {
    const pos = leveragedPositions.find((p) => p.id === positionId);
    if (!pos) return;
    const company = companies.find((c) => c.id === pos.companyId);
    const sizeRatio = company ? pos.qty / company.supply : 0;
    const impactPct = company ? Math.min(92, sizeRatio * 150) : 0;
    const avgExecPrice = company ? company.price * (1 - impactPct / 200) : pos.entryPrice;
    const pnl = (avgExecPrice - pos.entryPrice) * pos.qty;
    const payout = Math.max(0, pos.margin + pnl);
    adjustAccountBalance(pos.account || "personal", payout);
    setLeveragedPositions((prev) => prev.filter((p) => p.id !== positionId));
    logTx(`\u0417\u0430\u043A\u0440\u044B\u0442\u0438\u0435 \u043F\u043E\u0437\u0438\u0446\u0438\u0438 ${pos.ticker} \xD7${pos.leverage}`, payout, "in");
    if (pnl > 0) accrueTax(`\u041D\u0430\u043B\u043E\u0433 \u0441 \u043F\u0440\u0438\u0431\u044B\u043B\u0438 \u043F\u043E \u043F\u043B\u0435\u0447\u0443 (${pos.ticker})`, Math.round(pnl * 0.13));
    if (company) {
      applyImpact(pos.companyId, -impactPct);
      const recentPump = Date.now() - lastPumpAtRef.current < 12e4;
      if (pos.companyId === playerVentureId && sizeRatio > 0.05) flagSuspicion(sizeRatio * 55 + (recentPump ? 20 : 0));
      else if (sizeRatio > 0.08) flagSuspicion(sizeRatio * 28);
    }
    setTimeout(saveGame, 50);
  };
  const listingFee = form.kind === "crypto" ? 300 : 500;
  const createVenture = () => {
    const src = resolvedPayFrom;
    const bal = src === "personal" ? cash : src === "grey" ? greyAccount?.balance || 0 : bankAccounts[src]?.balance || 0;
    if (!form.name.trim() || !form.ticker.trim() || bal < listingFee) return;
    const id = makeId("co");
    const startPrice = form.kind === "crypto" ? 0.2 : 2;
    const supply = form.kind === "crypto" ? 2e4 : 2e3;
    const newVenture = {
      id,
      name: form.name.trim(),
      ticker: form.ticker.trim().toUpperCase().slice(0, 5),
      sector: form.kind === "crypto" ? "\u041A\u0440\u0438\u043F\u0442\u043E" : form.sector,
      kind: form.kind,
      strategy: form.kind === "crypto" ? form.strategy : void 0,
      price: startPrice,
      vol: form.kind === "crypto" ? form.strategy === "scam" ? 1.6 : 1.1 : 1,
      supply,
      isPlayer: true,
      marketingLevel: 0,
      rdLevel: 0,
      hypeLevel: 0,
      scamHeat: 0,
      rugged: false,
      investorRounds: 0,
      investorCooldown: 0,
      candles: Array.from({ length: 24 }, (_, i) => ({ o: startPrice, h: startPrice, l: startPrice, c: startPrice, t: Date.now() - (24 - i) * CANDLE_MS }))
    };
    const founderQty = Math.round(supply * FOUNDER_PCT[form.kind]);
    adjustAccountBalance(src, -listingFee);
    setCompanies((prev) => [...prev, newVenture]);
    setHoldings((h) => ({ ...h, [id]: { qty: founderQty, avgCost: 0 } }));
    setPlayerVentureId(id);
    setSelectedBizId("venture");
    setForm({ name: "", ticker: "", sector: SECTORS[0], kind: "company", strategy: "tech" });
    setBizPath(null);
    setActiveTab("company");
    setTimeout(saveGame, 50);
  };
  const closeVenture = () => {
    if (!playerVentureId) return;
    delete engineRef.current[playerVentureId];
    setCompanies((prev) => prev.filter((c) => c.id !== playerVentureId));
    setHoldings((h) => {
      const rest = { ...h };
      delete rest[playerVentureId];
      return rest;
    });
    setPlayerVentureId(null);
    setInvestorPersona(null);
    setActiveTab("company");
    setTimeout(saveGame, 50);
  };
  const RESELL_TOTAL_STARTUP = RESELL_STARTUP.registration + RESELL_STARTUP.rent + RESELL_STARTUP.equipment;
  const emptyCategoryMap = () => Object.fromEntries(PRODUCT_CATEGORIES.map((c) => [c.id, { stock: 0, avgCost: 0, listedPrice: 0 }]));
  const openOfflineStore = (shopId, tierId) => {
    const tier = OFFLINE_STORE_TIERS[tierId];
    const shop = resellShops.find((s) => s.id === shopId);
    if (!tier || !shop || shop.offlineStore || ipCash < tier.openingCost) return;
    setIpCash((c) => c - tier.openingCost);
    setResellShops((prev) => prev.map((s) => s.id === shopId ? { ...s, offlineStore: { tier: tierId, boostHealth: 70, missedTicks: 0, adUntilTick: 0, tickCount: 0, nextTickAt: Date.now() + OFFLINE_TICK_MS, totalOfflineRevenue: 0 } } : s));
    logTx(`\u041E\u0442\u043A\u0440\u044B\u0442\u0438\u0435 \u043E\u0444\u043B\u0430\u0439\u043D-\u043C\u0430\u0433\u0430\u0437\u0438\u043D\u0430 \xB7 ${tier.name}`, tier.openingCost, "out");
    setTimeout(saveGame, 50);
  };
  const closeOfflineStore = (shopId) => {
    setResellShops((prev) => prev.map((s) => s.id === shopId ? { ...s, offlineStore: null } : s));
    setTimeout(saveGame, 50);
  };
  const runOfflineAd = (shopId) => {
    const shop = resellShops.find((s) => s.id === shopId);
    if (!shop?.offlineStore) return;
    const tier = OFFLINE_STORE_TIERS[shop.offlineStore.tier];
    if (ipCash < tier.adCost) return;
    setIpCash((c) => c - tier.adCost);
    setResellShops((prev) => prev.map((s) => s.id === shopId ? { ...s, offlineStore: { ...s.offlineStore, adUntilTick: s.offlineStore.tickCount + OFFLINE_AD_DURATION_TICKS } } : s));
    logTx(`\u0420\u0435\u043A\u043B\u0430\u043C\u0430 \u043E\u0444\u043B\u0430\u0439\u043D-\u043C\u0430\u0433\u0430\u0437\u0438\u043D\u0430 \xB7 ${tier.name}`, tier.adCost, "out");
    setTimeout(saveGame, 50);
  };
  const startResellBusiness = (name) => {
    const src = resolvedPayFrom;
    const bal = src === "personal" ? cash : src === "grey" ? greyAccount?.balance || 0 : bankAccounts[src]?.balance || 0;
    if (bal < RESELL_TOTAL_STARTUP) return;
    adjustAccountBalance(src, -RESELL_TOTAL_STARTUP);
    const newId = makeId("shop");
    setResellShops((prev) => [...prev, {
      id: newId,
      name: name && name.trim() ? name.trim() : `\u041C\u0430\u0433\u0430\u0437\u0438\u043D \u2116${prev.length + 1}`,
      categories: emptyCategoryMap(),
      orders: [],
      totalRevenue: 0,
      totalUnitsSold: 0,
      rating: 4,
      reviews: [],
      ads: [],
      qualityScore: 0.6
    }]);
    setSelectedBizId(newId);
    setBizPath(null);
    setActiveTab("company");
    setTimeout(saveGame, 50);
  };
  const placeSupplierOrder = (shopId, supplierId, categoryId) => {
    const supplier = SUPPLIERS.find((s) => s.id === supplierId);
    const category = PRODUCT_CATEGORIES.find((c) => c.id === categoryId);
    if (!supplier || !category) return;
    const key = `${shopId}:${supplierId}:${categoryId}`;
    const qty = Math.round(Number(orderQtyInputs[key] || 0));
    if (!qty || qty <= 0) return;
    const supplierHealth = companyPerfPct(companies, supplier.companyTicker);
    const unitPrice = Math.round(supplier.pricePerUnit * category.priceMult * marketIndex * repPriceMult * supplierHealthPriceMult(supplierHealth) * 100) / 100;
    const totalCost = Math.round(unitPrice * qty);
    if (totalCost > ipCash) return;
    setIpCash((c) => c - totalCost);
    const order = {
      id: makeId("ord"),
      supplierId,
      category: categoryId,
      country: supplier.country,
      quality: supplier.quality,
      qty,
      unitCost: unitPrice,
      totalCost,
      foreign: supplier.foreign,
      orderedAt: Date.now(),
      arrivesAt: Date.now() + supplier.deliveryDays * DAY_MS,
      status: "shipping",
      customsTax: supplier.foreign ? Math.round(totalCost * 0.15) : 0,
      reviewScore: supplier.reviewScore
    };
    setResellShops((prev) => prev.map((s) => s.id === shopId ? { ...s, orders: [...s.orders, order] } : s));
    setOrderQtyInputs((f) => ({ ...f, [key]: "" }));
    logTx(`\u0417\u0430\u043A\u0443\u043F\u043A\u0430 \u0443 \u043F\u043E\u0441\u0442\u0430\u0432\u0449\u0438\u043A\u0430 \xB7 ${category.name} \xD7${qty}`, totalCost, "out");
    setTimeout(saveGame, 50);
  };
  const foldOrderIntoShop = (shop, order) => {
    const landedCost = order.totalCost + (order.customsTax || 0);
    const cats = shop.categories || emptyCategoryMap();
    const cur = cats[order.category] || { stock: 0, avgCost: 0, listedPrice: 0 };
    const newQty = cur.stock + order.qty;
    const newAvgCost = newQty > 0 ? (cur.stock * cur.avgCost + landedCost) / newQty : 0;
    const totalStockBefore = Object.values(cats).reduce((s, c) => s + c.stock, 0);
    const newQuality = totalStockBefore + order.qty > 0 ? (totalStockBefore * shop.qualityScore + order.qty * order.reviewScore) / (totalStockBefore + order.qty) : shop.qualityScore;
    return {
      ...shop,
      categories: { ...cats, [order.category]: { ...cur, stock: newQty, avgCost: newAvgCost } },
      qualityScore: newQuality,
      orders: shop.orders.filter((o) => o.id !== order.id)
    };
  };
  const payCustoms = (shopId, orderId) => {
    const shop = resellShops.find((s) => s.id === shopId);
    const order = shop?.orders.find((o) => o.id === orderId);
    if (!order || ipCash < order.customsTax) return;
    setIpCash((c) => c - order.customsTax);
    setResellShops((prev) => prev.map((s) => s.id === shopId ? foldOrderIntoShop(s, order) : s));
    logTx("\u0420\u0430\u0441\u0442\u0430\u043C\u043E\u0436\u043A\u0430 \u0437\u0430\u043A\u0430\u0437\u0430", order.customsTax, "out");
    setTimeout(saveGame, 50);
  };
  const applyListedPrice = (shopId, categoryId) => {
    const key = `${shopId}:${categoryId}`;
    const price = Number(listedPriceInputs[key]);
    if (!price || price <= 0) return;
    setResellShops((prev) => prev.map((s) => s.id === shopId ? { ...s, categories: { ...s.categories, [categoryId]: { ...s.categories[categoryId], listedPrice: price } } } : s));
    setListedPriceInputs((f) => ({ ...f, [key]: "" }));
    setTimeout(saveGame, 50);
  };
  const runAd = (shopId, tierId) => {
    const tier = AD_TIERS.find((t) => t.id === tierId);
    if (!tier || ipCash < tier.cost) return;
    setIpCash((c) => c - tier.cost);
    setResellShops((prev) => prev.map((s) => s.id === shopId ? { ...s, ads: [...s.ads || [], { id: makeId("ad"), tierId, boostMult: tier.boostMult, until: Date.now() + tier.durationMin * 6e4 }] } : s));
    setTimeout(saveGame, 50);
  };
  const runAdMultiple = (shopId, tierId, count) => {
    const tier = AD_TIERS.find((t) => t.id === tierId);
    if (!tier || count <= 0) return;
    const totalCost = tier.cost * count;
    if (totalCost > ipCash) return;
    setIpCash((c) => c - totalCost);
    const now = Date.now();
    const newAds = Array.from({ length: count }, () => ({ id: makeId("ad"), tierId, boostMult: tier.boostMult, until: now + tier.durationMin * 6e4 }));
    setResellShops((prev) => prev.map((s) => s.id === shopId ? { ...s, ads: [...s.ads || [], ...newAds] } : s));
    setTimeout(saveGame, 50);
  };
  const liquidateShopStock = (shopId) => {
    const shop = resellShops.find((s) => s.id === shopId);
    if (!shop) return;
    const cats = shop.categories || {};
    const payout = Math.round(Object.values(cats).reduce((sum, c) => sum + c.stock * c.avgCost, 0) * 0.5);
    if (payout <= 0) return;
    setIpCash((c) => c + payout);
    setResellShops((prev) => prev.map((s) => s.id === shopId ? { ...s, categories: emptyCategoryMap() } : s));
  };
  const closeResellShop = (shopId) => {
    liquidateShopStock(shopId);
    setResellShops((prev) => prev.filter((s) => s.id !== shopId));
    setConfirmCloseResell(null);
    setTimeout(saveGame, 50);
  };
  const transferToPersonal = (amount) => {
    const amt = Math.round(Number(amount));
    if (!amt || amt <= 0 || amt > ipCash) return;
    const fee = Math.round(amt * 0.02);
    setIpCash((c) => c - amt);
    setCash((c) => c + (amt - fee));
    setIpTransferInput("");
    logTx("\u041F\u0435\u0440\u0435\u0432\u043E\u0434 \u0441 \u0418\u041F \u0441\u0435\u0431\u0435", amt - fee, "in");
    setTimeout(saveGame, 50);
  };
  const depositToIp = (amount) => {
    const amt = Math.round(Number(amount));
    if (!amt || amt <= 0 || amt > cash) return;
    setCash((c) => c - amt);
    setIpCash((c) => c + amt);
    setIpTransferInput("");
    logTx("\u041F\u043E\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u0435 \u0441\u0447\u0451\u0442\u0430 \u0418\u041F", amt, "out");
    setTimeout(saveGame, 50);
  };
  const setBankFb = (bankId, ok, msg) => setBankTransferFeedback((f) => ({ ...f, [bankId]: { ok, msg } }));
  const completeOnboarding = (bankId) => {
    if (onboarded) return;
    const bank = BANK_ACCOUNTS.find((b) => b.id === bankId);
    if (!bank) return;
    setBankAccounts((prev) => ({
      ...prev,
      [bankId]: { balance: 1e3, cardLast4: String(Math.floor(1e3 + Math.random() * 9e3)), turnoverUsed: 0, turnoverResetAt: Date.now() + TURNOVER_RESET_MS, frozen: false, frozenUntil: null, openedAt: Date.now(), nextSavingsAt: Date.now() + bank.savingsIntervalMs, lifetimeTurnover: 0 }
    }));
    setCardLast4(String(Math.floor(1e3 + Math.random() * 9e3)));
    setOnboarded(true);
    setTimeout(saveGame, 50);
  };
  const openBankAccount = (bankId) => {
    const bank = BANK_ACCOUNTS.find((b) => b.id === bankId);
    if (!bank || bankAccounts[bankId]) return;
    const src = resolvedPayFrom;
    const bal = src === "personal" ? cash : src === "grey" ? greyAccount?.balance || 0 : bankAccounts[src]?.balance || 0;
    if (bal < bank.openingFee) return;
    if (bank.openingFee > 0) adjustAccountBalance(src, -bank.openingFee);
    setBankAccounts((prev) => ({
      ...prev,
      [bankId]: { balance: 0, cardLast4: String(Math.floor(1e3 + Math.random() * 9e3)), turnoverUsed: 0, turnoverResetAt: Date.now() + TURNOVER_RESET_MS, frozen: false, frozenUntil: null, openedAt: Date.now(), nextSavingsAt: Date.now() + bank.savingsIntervalMs, lifetimeTurnover: 0 }
    }));
    if (bank.openingFee > 0) logTx(`\u041E\u0442\u043A\u0440\u044B\u0442\u0438\u0435 \u0441\u0447\u0451\u0442\u0430 \xB7 ${bank.name}`, bank.openingFee, "out");
    setTimeout(saveGame, 50);
  };
  const depositToBankAccount = (bankId, amount) => {
    const bank = BANK_ACCOUNTS.find((b) => b.id === bankId);
    const acct = bankAccounts[bankId];
    const amt = Math.round(Number(amount));
    if (!bank || !acct) return;
    const src = resolvedPayFrom === bankId ? "personal" : resolvedPayFrom;
    const bal = src === "personal" ? cash : src === "grey" ? greyAccount?.balance || 0 : bankAccounts[src]?.balance || 0;
    if (!amt || amt <= 0 || amt > bal) return;
    adjustAccountBalance(src, -amt);
    setBankAccounts((prev) => ({ ...prev, [bankId]: { ...prev[bankId], balance: prev[bankId].balance + amt } }));
    setBankTransferInputs((f) => ({ ...f, [bankId]: "" }));
    logTx(`\u041F\u043E\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u0435 \u0441\u0447\u0451\u0442\u0430 \xB7 ${bank.name}`, amt, "out");
    setTimeout(saveGame, 50);
  };
  const withdrawFromBankAccount = (bankId, amount, destOverride) => {
    const bank = BANK_ACCOUNTS.find((b) => b.id === bankId);
    const acct = bankAccounts[bankId];
    const amt = Math.round(Number(amount));
    const dest = destOverride || bankTransferDest[bankId] || "ip";
    if (!bank || !acct) return;
    if (acct.frozen) {
      setBankFb(bankId, false, "\u0421\u0447\u0451\u0442 \u0437\u0430\u043C\u043E\u0440\u043E\u0436\u0435\u043D \u0438\u043D\u0441\u043F\u0435\u043A\u0446\u0438\u0435\u0439 \u2014 \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u044B \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B \u0434\u043E \u043E\u043A\u043E\u043D\u0447\u0430\u043D\u0438\u044F \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0438");
      return;
    }
    if (!amt || amt <= 0) {
      setBankFb(bankId, false, "\u0423\u043A\u0430\u0436\u0438 \u0441\u0443\u043C\u043C\u0443");
      return;
    }
    const limits = bankAccountLimits(bank, acct);
    const fee = amt > limits.singleLimit ? Math.round(amt * bank.overLimitFee) : 0;
    const total = amt + fee;
    if (total > acct.balance) {
      setBankFb(bankId, false, "\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0441\u0440\u0435\u0434\u0441\u0442\u0432 \u043D\u0430 \u0441\u0447\u0451\u0442\u0435 \u0441 \u0443\u0447\u0451\u0442\u043E\u043C \u043A\u043E\u043C\u0438\u0441\u0441\u0438\u0438");
      return;
    }
    const remainingTurnover = limits.turnoverCap - acct.turnoverUsed;
    if (amt > remainingTurnover) {
      setBankFb(bankId, false, `\u041F\u0440\u0435\u0432\u044B\u0448\u0435\u043D \u043B\u0438\u043C\u0438\u0442 \u043E\u0431\u043E\u0440\u043E\u0442\u0430 \u2014 \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u043E \u0435\u0449\u0451 ${fmt(Math.max(0, remainingTurnover))} \u0434\u043E \u0441\u0431\u0440\u043E\u0441\u0430`);
      return;
    }
    setBankAccounts((prev) => ({ ...prev, [bankId]: { ...prev[bankId], balance: prev[bankId].balance - total, turnoverUsed: prev[bankId].turnoverUsed + amt, lifetimeTurnover: (prev[bankId].lifetimeTurnover || 0) + amt } }));
    if (dest === "personal") {
      setCash((c) => c + amt);
    } else if (dest === "ip") {
      setIpCash((c) => c + amt);
    } else if (dest === "grey") {
      setGreyAccount((a) => a ? { ...a, balance: a.balance + amt } : a);
    } else {
      setBankAccounts((prev) => prev[dest] ? { ...prev, [dest]: { ...prev[dest], balance: prev[dest].balance + amt } } : prev);
    }
    logTx(`\u041F\u0435\u0440\u0435\u0432\u043E\u0434 \u0438\u0437 ${bank.name}${fee > 0 ? ` (\u043A\u043E\u043C\u0438\u0441\u0441\u0438\u044F ${fmt(fee)})` : ""}`, total, "out");
    const nearLimit = amt >= limits.singleLimit * 0.85 && amt <= limits.singleLimit * 1.05;
    if (amt > limits.singleLimit * 0.5) flagTransferSuspicion(bankId, amt / limits.singleLimit * (nearLimit ? 18 : 8));
    setBankTransferInputs((f) => ({ ...f, [bankId]: "" }));
    setBankFb(bankId, true, `\u041F\u0435\u0440\u0435\u0432\u0435\u0434\u0435\u043D\u043E ${fmt(amt)}${fee > 0 ? `, \u043A\u043E\u043C\u0438\u0441\u0441\u0438\u044F ${fmt(fee)}` : ""}`);
    setTimeout(saveGame, 50);
  };
  const flagGreySuspicion = (points) => {
    if (points <= 0) return;
    setGreySuspicion((s) => Math.min(200, s + points));
  };
  const openGreyAccount = () => {
    if (greyAccount) return;
    const src = resolvedPayFrom;
    const bal = src === "personal" ? cash : src === "grey" ? greyAccount?.balance || 0 : bankAccounts[src]?.balance || 0;
    if (bal < GREY_BANK.openingFee) return;
    adjustAccountBalance(src, -GREY_BANK.openingFee);
    setGreyAccount({ balance: 0, cardLast4: String(Math.floor(1e3 + Math.random() * 9e3)), pendingTransfers: [], lifetimeInflow: 0, frozen: false, frozenUntil: null, nextSavingsAt: Date.now() + GREY_BANK.savingsIntervalMs });
    logTx("\u041E\u0442\u043A\u0440\u044B\u0442\u0438\u0435 \u043E\u0444\u0448\u043E\u0440\u043D\u043E\u0433\u043E \u0441\u0447\u0451\u0442\u0430 \xB7 Meridian", GREY_BANK.openingFee, "out");
    setTimeout(saveGame, 50);
  };
  const depositToGrey = (amount) => {
    const amt = Math.round(Number(amount));
    if (!greyAccount || greyAccount.frozen || !amt || amt <= 0 || amt > cash) return;
    const fee = Math.round(amt * GREY_BANK.transferFee);
    const net = amt - fee;
    setCash((c) => c - amt);
    const arrivesAt = Date.now() + GREY_BANK.transferDelayMs;
    setGreyAccount((prev) => ({
      ...prev,
      pendingTransfers: [...prev.pendingTransfers, { id: makeId("gtx"), amount: net, arrivesAt }],
      lifetimeInflow: prev.lifetimeInflow + net
    }));
    if (greyAccount.lifetimeInflow + net > GREY_BANK.detectionThreshold) {
      const over = Math.min(net, greyAccount.lifetimeInflow + net - GREY_BANK.detectionThreshold);
      flagGreySuspicion(over / 1e3 * 6);
    }
    logTx(`\u041F\u0435\u0440\u0435\u0432\u043E\u0434 \u0432 Meridian Offshore (\u043A\u043E\u043C\u0438\u0441\u0441\u0438\u044F ${fmt(fee)}, \u043F\u0440\u0438\u0434\u0451\u0442 \u0447\u0435\u0440\u0435\u0437 2 \u043C\u0438\u043D)`, amt, "out");
    setGreyTransferInput("");
    setGreyFeedback({ ok: true, msg: `\u0412 \u043F\u0443\u0442\u0438: ${fmt(net)}, \u043F\u043E\u0441\u0442\u0443\u043F\u0438\u0442 \u043F\u0440\u0438\u043C\u0435\u0440\u043D\u043E \u0447\u0435\u0440\u0435\u0437 2 \u043C\u0438\u043D\u0443\u0442\u044B` });
    setTimeout(saveGame, 50);
  };
  const withdrawFromGrey = (amount, destOverride) => {
    const amt = Math.round(Number(amount));
    const dest = destOverride || greyTransferDest;
    if (!greyAccount) return;
    if (greyAccount.frozen) {
      setGreyFeedback({ ok: false, msg: "\u0421\u0447\u0451\u0442 \u0437\u0430\u043C\u043E\u0440\u043E\u0436\u0435\u043D \u2014 \u0438\u0434\u0451\u0442 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u043F\u0440\u043E\u0438\u0441\u0445\u043E\u0436\u0434\u0435\u043D\u0438\u044F \u0441\u0440\u0435\u0434\u0441\u0442\u0432" });
      return;
    }
    if (!amt || amt <= 0) {
      setGreyFeedback({ ok: false, msg: "\u0423\u043A\u0430\u0436\u0438 \u0441\u0443\u043C\u043C\u0443" });
      return;
    }
    const fee = Math.round(amt * GREY_BANK.transferFee);
    const total = amt + fee;
    if (total > greyAccount.balance) {
      setGreyFeedback({ ok: false, msg: "\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0441\u0440\u0435\u0434\u0441\u0442\u0432 \u043D\u0430 \u0441\u0447\u0451\u0442\u0435 \u0441 \u0443\u0447\u0451\u0442\u043E\u043C \u043A\u043E\u043C\u0438\u0441\u0441\u0438\u0438" });
      return;
    }
    setGreyAccount((prev) => ({ ...prev, balance: prev.balance - total }));
    if (dest === "personal") {
      setCash((c) => c + amt);
    } else if (dest === "ip") {
      setIpCash((c) => c + amt);
    } else {
      setBankAccounts((prev) => prev[dest] ? { ...prev, [dest]: { ...prev[dest], balance: prev[dest].balance + amt } } : prev);
    }
    logTx(`\u041F\u0435\u0440\u0435\u0432\u043E\u0434 \u0438\u0437 Meridian Offshore (\u043A\u043E\u043C\u0438\u0441\u0441\u0438\u044F ${fmt(fee)})`, total, "out");
    setGreyTransferInput("");
    setGreyFeedback({ ok: true, msg: `\u0412\u044B\u0432\u0435\u0434\u0435\u043D\u043E ${fmt(amt)}, \u043A\u043E\u043C\u0438\u0441\u0441\u0438\u044F ${fmt(fee)}` });
    setTimeout(saveGame, 50);
  };
  const universalTransfer = (fromId, toId, amount) => {
    const amt = Math.round(Number(amount));
    if (!amt || amt <= 0 || fromId === toId) {
      setXferFeedback({ ok: false, msg: "\u041F\u0440\u043E\u0432\u0435\u0440\u044C \u0441\u0443\u043C\u043C\u0443 \u0438 \u0441\u0447\u0435\u0442\u0430" });
      return;
    }
    if (fromId === "personal") {
      if (toId === "ip") depositToIp(amt);
      else if (toId === "grey") depositToGrey(amt);
      else depositToBankAccount(toId, amt);
    } else if (fromId === "ip") {
      if (toId === "personal") transferToPersonal(amt);
      else {
        setXferFeedback({ ok: false, msg: "\u0421 \u0418\u041F \u043C\u043E\u0436\u043D\u043E \u043F\u0435\u0440\u0435\u0432\u0435\u0441\u0442\u0438 \u0442\u043E\u043B\u044C\u043A\u043E \u0441\u0435\u0431\u0435 \u043D\u0430 \u043B\u0438\u0447\u043D\u044B\u0439 \u0441\u0447\u0451\u0442" });
        return;
      }
    } else if (fromId === "grey") {
      withdrawFromGrey(amt, toId);
    } else {
      withdrawFromBankAccount(fromId, amt, toId);
    }
    setXferAmount("");
    setXferFeedback({ ok: true, msg: "\u041F\u0435\u0440\u0435\u0432\u043E\u0434 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D" });
  };
  const adjustAccountBalance = (accountId, delta) => {
    if (accountId === "personal") {
      setCash((c) => c + delta);
      return;
    }
    if (accountId === "grey") {
      setGreyAccount((a) => a ? { ...a, balance: a.balance + delta } : a);
      return;
    }
    if (accountId === "ip") {
      setIpCash((c) => c + delta);
      return;
    }
    setBankAccounts((prev) => prev[accountId] ? { ...prev, [accountId]: { ...prev[accountId], balance: prev[accountId].balance + delta } } : prev);
  };
  const refreshBlackMarketOffers = () => {
    const offers = Array.from({ length: BLACKMARKET_JOB_COUNT }, () => ({ id: makeId("bmoffer"), amount: Math.round((500 + Math.random() * 19500) / 50) * 50 }));
    setBlackMarketOffers(offers);
  };
  const selectBlackMarketOffer = (offerId) => {
    if (blackMarketRound) return;
    const offer = blackMarketOffers.find((o) => o.id === offerId);
    if (!offer) return;
    setBlackMarketRound({ id: makeId("bm"), amount: offer.amount, stage: "offered", accountId: null, offerId: offer.id });
  };
  const acceptBlackMarketJob = (accountId) => {
    if (!blackMarketRound || blackMarketRound.stage !== "offered") return;
    const { amount, offerId } = blackMarketRound;
    adjustAccountBalance(accountId, amount);
    logTx("\u0427\u0451\u0440\u043D\u044B\u0439 \u0440\u044B\u043D\u043E\u043A: \u043F\u0440\u0438\u0451\u043C \u043F\u043B\u0430\u0442\u0435\u0436\u0430", amount, "in");
    const now = Date.now();
    setBlackMarketRound((r) => r ? { ...r, stage: "received", accountId, receivedAt: now, deadlineAt: now + 10 * 60 * 1e3 } : r);
    setBlackMarketOffers((prev) => prev.filter((o) => o.id !== offerId));
    setTimeout(saveGame, 50);
  };
  const cancelBlackMarketJob = () => {
    if (!blackMarketRound || blackMarketRound.stage !== "offered") return;
    setBlackMarketRound(null);
  };
  const sendBlackMarketCrypto = (companyId) => {
    if (!blackMarketRound || blackMarketRound.stage !== "received") return;
    const { amount, accountId } = blackMarketRound;
    const forward = Math.round(amount * (1 - blackMarketCutRate(amount)));
    const poolType = accountId === "ip" ? "ip" : accountId === "grey" ? "grey" : "personal";
    const pool = poolType === "ip" ? ipHoldings : poolType === "grey" ? greyHoldings : holdings;
    const setPool = poolType === "ip" ? setIpHoldings : poolType === "grey" ? setGreyHoldings : setHoldings;
    const company = companies.find((c) => c.id === companyId);
    if (!company) return;
    const held = pool[companyId]?.qty || 0;
    const value = held * company.price;
    const isTeher = company.ticker === TEHER_TICKER;
    const requiredValue = forward * (isTeher ? 1 + TEHER_TRANSFER_FEE : 1);
    if (value < requiredValue) return;
    const qtyNeeded = requiredValue / company.price;
    setPool((h) => {
      const prevH = h[companyId];
      const newQty = prevH.qty - qtyNeeded;
      if (newQty <= 1e-4) {
        const rest = { ...h };
        delete rest[companyId];
        return rest;
      }
      return { ...h, [companyId]: { ...prevH, qty: newQty } };
    });
    const isOwnCoin = companyId === playerVentureId;
    logTx(`\u0427\u0451\u0440\u043D\u044B\u0439 \u0440\u044B\u043D\u043E\u043A: \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u0430 ${company.ticker} \u043F\u043E\u043B\u0443\u0447\u0430\u0442\u0435\u043B\u044E${isTeher ? " (\u043A\u043E\u043C\u0438\u0441\u0441\u0438\u044F TEHER 1%)" : ""}`, forward, "out");
    setBlackMarketVolume((v) => v + amount);
    const ipLegitTurnover = resellShops.reduce((s, x) => s + x.totalRevenue, 0);
    if (accountId === "ip" && ipLegitTurnover < 200) {
      triggerBlackMarketBust("\u041D\u043E\u0432\u043E\u0435 \u0418\u041F \u0431\u0435\u0437 \u0440\u0435\u0430\u043B\u044C\u043D\u043E\u0433\u043E \u043E\u0431\u043E\u0440\u043E\u0442\u0430 \u0441\u0440\u0430\u0437\u0443 \u043D\u0430\u0447\u0430\u043B\u043E \u0433\u043E\u043D\u044F\u0442\u044C \u043A\u0440\u0443\u043F\u043D\u044B\u0435 \u0441\u0443\u043C\u043C\u044B \u2014 \u0444\u0438\u043D\u043C\u043E\u043D\u0438\u0442\u043E\u0440\u0438\u043D\u0433 \u0437\u0430\u043C\u0435\u0442\u0438\u043B \u043C\u0433\u043D\u043E\u0432\u0435\u043D\u043D\u043E. \u0412\u0441\u0435 \u0441\u0447\u0435\u0442\u0430 \u0437\u0430\u043C\u043E\u0440\u043E\u0436\u0435\u043D\u044B, \u0448\u0442\u0440\u0430\u0444 \u0432\u044B\u043F\u0438\u0441\u0430\u043D.");
    } else {
      const coverMult = accountId === "ip" ? Math.max(0.25, 1 - Math.min(0.75, ipLegitTurnover / 25e3)) : 1;
      setBlackMarketHeat((h) => Math.min(200, h + ((isOwnCoin ? 20 : 8) + amount / 500 * (isOwnCoin ? 1.6 : 1)) * coverMult));
    }
    setBlackMarketRoundsDone((n) => n + 1);
    setBlackMarketRound(null);
    setTimeout(saveGame, 50);
  };
  const muleCardPrice = (bankId) => {
    const bank = BANK_ACCOUNTS.find((b) => b.id === bankId);
    return bank ? Math.round(bank.singleLimit * 0.4) : 0;
  };
  const buyMuleCard = (bankId) => {
    const bank = BANK_ACCOUNTS.find((b) => b.id === bankId);
    const price = muleCardPrice(bankId);
    if (!bank) return;
    const src = resolvedPayFrom;
    const bal = src === "personal" ? cash : src === "grey" ? greyAccount?.balance || 0 : bankAccounts[src]?.balance || 0;
    if (bal < price) return;
    adjustAccountBalance(src, -price);
    const id = makeId("mule");
    setMuleCards((prev) => ({
      ...prev,
      [id]: { bankId, cardLast4: String(Math.floor(1e3 + Math.random() * 9e3)), balance: 0, turnoverUsed: 0, turnoverResetAt: Date.now() + TURNOVER_RESET_MS, frozen: false, warmth: 0, lifetimeTurnover: 0, purchasedAt: Date.now(), nextTheftCheckAt: Date.now() + MULE_THEFT_CHECK_MS }
    }));
    logTx(`\u0427\u0451\u0440\u043D\u044B\u0439 \u0440\u044B\u043D\u043E\u043A: \u043A\u0430\u0440\u0442\u0430 \u043D\u0430 \u0447\u0443\u0436\u043E\u0435 \u0438\u043C\u044F \xB7 ${bank.name}`, price, "out");
    setTimeout(saveGame, 50);
  };
  const closeMuleCard = (muleId) => {
    setMuleCards((prev) => {
      const rest = { ...prev };
      delete rest[muleId];
      return rest;
    });
    setTimeout(saveGame, 50);
  };
  const setMuleFb = (muleId, ok, msg) => setMuleFeedback((f) => ({ ...f, [muleId]: { ok, msg } }));
  const depositToMuleCard = (muleId, amount) => {
    const card = muleCards[muleId];
    const amt = Math.round(Number(amount));
    if (!card || card.frozen || !amt || amt <= 0 || amt > cash) return;
    const bank = BANK_ACCOUNTS.find((b) => b.id === card.bankId);
    const isSmall = amt <= bank.singleLimit * 0.15;
    setCash((c) => c - amt);
    setMuleCards((prev) => ({ ...prev, [muleId]: { ...prev[muleId], balance: prev[muleId].balance + amt, warmth: Math.min(100, prev[muleId].warmth + (isSmall ? MULE_WARMUP_SMALL_TX_GAIN : 0)) } }));
    setMuleTransferInputs((f) => ({ ...f, [muleId]: "" }));
    logTx(`\u041F\u043E\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u0435 \u043A\u0430\u0440\u0442\u044B \u043D\u0430 \u0447\u0443\u0436\u043E\u0435 \u0438\u043C\u044F \xB7 ${bank.name}`, amt, "out");
    setMuleFb(muleId, true, "\u041F\u043E\u043F\u043E\u043B\u043D\u0435\u043D\u043E");
    setTimeout(saveGame, 50);
  };
  const withdrawFromMuleCard = (muleId, amount) => {
    const card = muleCards[muleId];
    const bank = BANK_ACCOUNTS.find((b) => b.id === card?.bankId);
    const amt = Math.round(Number(amount));
    const dest = muleTransferDest[muleId] || "ip";
    if (!card || !bank) return;
    if (card.frozen) {
      setMuleFb(muleId, false, "\u041A\u0430\u0440\u0442\u0430 \u0437\u0430\u0431\u043B\u043E\u043A\u0438\u0440\u043E\u0432\u0430\u043D\u0430 \u0431\u0430\u043D\u043A\u043E\u043C \u2014 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 \u043D\u0435\u043B\u044C\u0437\u044F");
      return;
    }
    if (!amt || amt <= 0) {
      setMuleFb(muleId, false, "\u0423\u043A\u0430\u0436\u0438 \u0441\u0443\u043C\u043C\u0443");
      return;
    }
    const fee = amt > bank.singleLimit ? Math.round(amt * bank.overLimitFee) : 0;
    const total = amt + fee;
    if (total > card.balance) {
      setMuleFb(muleId, false, "\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0441\u0440\u0435\u0434\u0441\u0442\u0432 \u043D\u0430 \u043A\u0430\u0440\u0442\u0435 \u0441 \u0443\u0447\u0451\u0442\u043E\u043C \u043A\u043E\u043C\u0438\u0441\u0441\u0438\u0438");
      return;
    }
    const remainingTurnover = bank.turnoverCap - card.turnoverUsed;
    if (amt > remainingTurnover) {
      setMuleFb(muleId, false, `\u041F\u0440\u0435\u0432\u044B\u0448\u0435\u043D \u043B\u0438\u043C\u0438\u0442 \u043E\u0431\u043E\u0440\u043E\u0442\u0430 \u2014 \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u043E \u0435\u0449\u0451 ${fmt(Math.max(0, remainingTurnover))} \u0434\u043E \u0441\u0431\u0440\u043E\u0441\u0430`);
      return;
    }
    const isSmall = amt <= bank.singleLimit * 0.15;
    if (!isSmall && card.warmth < MULE_WARMUP_TARGET) {
      const blockChance = (MULE_WARMUP_TARGET - card.warmth) / MULE_WARMUP_TARGET * Math.min(1, amt / bank.singleLimit) * 0.5;
      if (Math.random() < blockChance) {
        setMuleCards((prev) => ({ ...prev, [muleId]: { ...prev[muleId], frozen: true, balance: 0 } }));
        pushPost({ text: `${bank.name} \u0437\u0430\u0431\u043B\u043E\u043A\u0438\u0440\u043E\u0432\u0430\u043B \u043A\u0430\u0440\u0442\u0443 \u043F\u043E 115-\u0424\u0417 \u2014 \u0437\u0430\u043F\u043E\u0434\u043E\u0437\u0440\u0438\u043B\u0438, \u0447\u0442\u043E \u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442\u0441\u044F \u043D\u0435 \u0432\u043B\u0430\u0434\u0435\u043B\u0435\u0446`, positive: false, isMacro: true });
        flagSuspicion(20);
        setMuleFb(muleId, false, "\u0417\u0430\u0431\u043B\u043E\u043A\u0438\u0440\u043E\u0432\u0430\u043D\u0430 \u0431\u0430\u043D\u043A\u043E\u043C \u2014 \u043E\u043F\u0435\u0440\u0430\u0446\u0438\u044F \u043D\u0435 \u043F\u0440\u043E\u0448\u043B\u0430, \u043A\u0430\u0440\u0442\u0430 \u043F\u043E\u0442\u0435\u0440\u044F\u043D\u0430");
        setTimeout(saveGame, 50);
        return;
      }
    }
    setMuleCards((prev) => ({ ...prev, [muleId]: { ...prev[muleId], balance: prev[muleId].balance - total, turnoverUsed: prev[muleId].turnoverUsed + amt, lifetimeTurnover: prev[muleId].lifetimeTurnover + amt, warmth: Math.min(100, prev[muleId].warmth + (isSmall ? MULE_WARMUP_SMALL_TX_GAIN : 0)) } }));
    if (dest === "personal") setCash((c) => c + amt);
    else if (dest === "ip") setIpCash((c) => c + amt);
    else if (dest === "grey") setGreyAccount((a) => a ? { ...a, balance: a.balance + amt } : a);
    else setBankAccounts((prev) => prev[dest] ? { ...prev, [dest]: { ...prev[dest], balance: prev[dest].balance + amt } } : prev);
    logTx(`\u041E\u0431\u043D\u0430\u043B\u0438\u0447\u043A\u0430 \u0441 \u0447\u0443\u0436\u043E\u0439 \u043A\u0430\u0440\u0442\u044B \xB7 ${bank.name}${fee > 0 ? ` (\u043A\u043E\u043C\u0438\u0441\u0441\u0438\u044F ${fmt(fee)})` : ""}`, total, "out");
    const nearLimit = amt >= bank.singleLimit * 0.85 && amt <= bank.singleLimit * 1.05;
    if (amt > bank.singleLimit * 0.5) flagTransferSuspicion(card.bankId, amt / bank.singleLimit * (nearLimit ? 12 : 5));
    setMuleTransferInputs((f) => ({ ...f, [muleId]: "" }));
    setMuleFb(muleId, true, `\u041F\u0435\u0440\u0435\u0432\u0435\u0434\u0435\u043D\u043E ${fmt(amt)}${fee > 0 ? `, \u043A\u043E\u043C\u0438\u0441\u0441\u0438\u044F ${fmt(fee)}` : ""}`);
    setTimeout(saveGame, 50);
  };
  const stockCollateralValue = resellShops.reduce((sum, s) => sum + Object.values(s.categories || {}).reduce((cs, c) => cs + c.stock * c.avgCost, 0), 0);
  const ipTurnover = resellShops.reduce((sum, s) => sum + s.totalRevenue, 0);
  const bzkrHealth = companyPerfPct(companies, IP_BANK.ticker);
  const ipLoanLimit = Math.round((IP_BANK.baseMax + stockCollateralValue * IP_BANK.maxLTV + ipCash * IP_BANK.cashMult + ipTurnover * IP_BANK.turnoverMult) * repFactor * bankRatingLimitMult(ipBankRating) * bankHealthLimitMult(bzkrHealth));
  const applyForIpLoan = () => {
    const amount = Math.round(Number(ipLoanInput));
    if (!amount || amount <= 0) {
      setIpLoanFeedback({ ok: false, msg: "\u0423\u043A\u0430\u0436\u0438 \u0441\u0443\u043C\u043C\u0443" });
      return;
    }
    if (ipLoans.length > 0) {
      setIpLoanFeedback({ ok: false, msg: "\u0423\u0436\u0435 \u0435\u0441\u0442\u044C \u0430\u043A\u0442\u0438\u0432\u043D\u044B\u0439 \u0431\u0438\u0437\u043D\u0435\u0441-\u043A\u0440\u0435\u0434\u0438\u0442" });
      return;
    }
    if (amount > ipLoanLimit) {
      setIpLoanFeedback({ ok: false, msg: `\u041F\u0440\u0438 \u0442\u0435\u043A\u0443\u0449\u0435\u043C \u043E\u0431\u043E\u0440\u043E\u0442\u0435 \u0438 \u0438\u0441\u0442\u043E\u0440\u0438\u0438 \u0431\u0430\u043D\u043A \u0434\u0430\u0451\u0442 \u043C\u0430\u043A\u0441\u0438\u043C\u0443\u043C \u2248 ${fmt(ipLoanLimit)}. \u0411\u043E\u043B\u044C\u0448\u0435 \u043E\u0431\u043E\u0440\u043E\u0442 \u2014 \u0431\u043E\u043B\u044C\u0448\u0435 \u043B\u0438\u043C\u0438\u0442.` });
      return;
    }
    setIpCash((c) => c + amount);
    setIpLoans((prev) => [...prev, { id: makeId("iploan"), principal: amount, balance: amount, ratePerTick: IP_BANK.ratePerTick * repRateMult * bankRatingRateMult(ipBankRating) * bankHealthRateMult(bzkrHealth), minPayment: Math.round(amount * 0.1), dueIn: DUE_CYCLE_SECONDS, paidThisCycle: false, frozen: false, seizedRecently: false }]);
    setIpLoanInput("");
    setIpLoanFeedback({ ok: true, msg: `\u041E\u0434\u043E\u0431\u0440\u0435\u043D\u043E: ${fmt(amount)}` });
    setTimeout(saveGame, 50);
  };
  const repayIpLoan = (loanId, amount) => {
    const l = ipLoans.find((x) => x.id === loanId);
    if (!l || amount <= 0 || amount > ipCash) return;
    const newBalance = l.balance - amount;
    const metMin = amount >= l.minPayment;
    setIpCash((c) => c - amount);
    if (newBalance <= 0) {
      setIpLoans((prev) => prev.filter((x) => x.id !== loanId));
      adjustIpBankRating(l.seizedRecently ? 5 : 10);
    } else {
      const ratio = newBalance / l.principal;
      setIpLoans((prev) => prev.map((x) => x.id === loanId ? { ...x, balance: Number(newBalance.toFixed(2)), paidThisCycle: metMin ? true : x.paidThisCycle, frozen: ratio >= 1.5, seizedRecently: ratio < 1.5 ? false : x.seizedRecently } : x));
    }
    logTx("\u041F\u043B\u0430\u0442\u0451\u0436 \u043F\u043E \u0431\u0438\u0437\u043D\u0435\u0441-\u043A\u0440\u0435\u0434\u0438\u0442\u0443", amount, "out");
    setTimeout(saveGame, 50);
  };
  const payDeclaration = (declId) => {
    const d = declarations.find((x) => x.id === declId);
    if (!d || d.paid || ipCash < d.tax) return;
    setIpCash((c) => c - d.tax);
    setDeclarations((prev) => prev.map((x) => x.id === declId ? { ...x, paid: true } : x));
    setTimeout(saveGame, 50);
  };
  const pitchInvestorsWithAngle = (angleId) => {
    const v = companies.find((c) => c.id === playerVentureId);
    if (!v || (v.investorCooldown || 0) > 0 || !investorPersona) return;
    const matched = angleId === investorPersona.likes;
    const bonus = (v.marketingLevel || 0) * 0.02 + (v.rdLevel || 0) * 0.02 + (v.investorRounds || 0) * 0.01;
    const chance = Math.min(0.92, ((matched ? 0.7 : 0.2) + bonus) * repFactor);
    const success = Math.random() < chance;
    if (success) {
      const dilution = 0.12 + Math.random() * 0.13;
      const newShares = Math.round(v.supply * dilution);
      const pop = 8 + Math.random() * 12;
      applyImpact(v.id, pop);
      flagLeveragedPumpPattern(v.id, pop);
      setCompanies((prev) => prev.map((c) => c.id === v.id ? { ...c, supply: c.supply + newShares, investorRounds: (c.investorRounds || 0) + 1, investorCooldown: 90 } : c));
      pushPost({ text: `${v.ticker}: ${investorPersona.name} \u0432\u043F\u0435\u0447\u0430\u0442\u043B\u0451\u043D${matched ? " \u2014 \u043F\u043E\u043F\u0430\u0434\u0430\u043D\u0438\u0435 \u0442\u043E\u0447\u043D\u043E \u0432 \u0435\u0433\u043E \u0438\u043D\u0442\u0435\u0440\u0435\u0441\u044B" : ""} \u2014 \u0440\u0430\u0443\u043D\u0434 \u0437\u0430\u043A\u0440\u044B\u0442`, positive: true, isMacro: false, ticker: v.ticker });
    } else {
      setCompanies((prev) => prev.map((c) => c.id === v.id ? { ...c, investorCooldown: 60 } : c));
      pushPost({ text: `${v.ticker}: ${investorPersona.name} \u043D\u0435 \u0432\u043F\u0435\u0447\u0430\u0442\u043B\u0451\u043D \u043F\u0438\u0442\u0447\u0435\u043C \u2014 \u043E\u0442\u043A\u0430\u0437`, positive: false, isMacro: false, ticker: v.ticker });
    }
    setInvestorPersona(null);
    setTimeout(saveGame, 50);
  };
  const investInVenture = (action) => {
    const v = companies.find((c) => c.id === playerVentureId);
    if (!v) return;
    const src = resolvedPayFrom;
    const bal = src === "personal" ? cash : src === "grey" ? greyAccount?.balance || 0 : bankAccounts[src]?.balance || 0;
    lastPumpAtRef.current = Date.now();
    if (action === "marketing") {
      const cost = Math.round(700 * Math.pow(1.65, v.marketingLevel || 0));
      if (bal < cost) return;
      adjustAccountBalance(src, -cost);
      const pop = (3 + (v.marketingLevel || 0) * 0.6) * repFactor;
      applyImpact(v.id, pop);
      flagLeveragedPumpPattern(v.id, pop);
      setCompanies((prev) => prev.map((c) => c.id === v.id ? { ...c, marketingLevel: (c.marketingLevel || 0) + 1 } : c));
      pushPost({ id: makeId("news"), text: `${v.ticker}: \u043C\u0430\u0440\u043A\u0435\u0442\u0438\u043D\u0433\u043E\u0432\u0430\u044F \u043A\u0430\u043C\u043F\u0430\u043D\u0438\u044F \u043F\u043E\u0434\u043D\u044F\u043B\u0430 \u0438\u043D\u0442\u0435\u0440\u0435\u0441`, positive: true, isMacro: false, ticker: v.ticker });
    } else if (action === "rd") {
      const cost = Math.round(1e3 * Math.pow(1.55, v.rdLevel || 0));
      if (bal < cost) return;
      adjustAccountBalance(src, -cost);
      const pop = (1.5 + Math.random() * 2.5) * repFactor;
      applyImpact(v.id, pop);
      flagLeveragedPumpPattern(v.id, pop);
      setCompanies((prev) => prev.map((c) => c.id === v.id ? { ...c, rdLevel: (c.rdLevel || 0) + 1, vol: Math.max(0.3, c.vol * 0.9) } : c));
      pushPost({ id: makeId("news"), text: `${v.ticker}: \u043D\u043E\u0432\u0430\u044F \u0440\u0430\u0437\u0440\u0430\u0431\u043E\u0442\u043A\u0430 \u0443\u043A\u0440\u0435\u043F\u0438\u043B\u0430 \u043F\u043E\u0437\u0438\u0446\u0438\u0438`, positive: true, isMacro: false, ticker: v.ticker });
    } else {
      const configs = {
        hypeSocial: { cost: Math.round(150 * Math.pow(1.5, v.hypeLevel || 0)), successChance: 0.7, popRange: [3, 7], heat: 8, label: "\u043F\u043E\u0441\u0442 \u0432 \u0441\u043E\u0446\u0441\u0435\u0442\u044F\u0445" },
        hypeBlogger: { cost: Math.round(450 * Math.pow(1.45, v.hypeLevel || 0)), successChance: 0.55, popRange: [7, 14], heat: 14, label: "\u0440\u0435\u043A\u043B\u0430\u043C\u0430 \u0443 \u0431\u043B\u043E\u0433\u0435\u0440\u043E\u0432" },
        hypePR: { cost: Math.round(1e3 * Math.pow(1.4, v.hypeLevel || 0)), successChance: 0.4, popRange: [14, 25], heat: 20, label: "PR \u0432 \u0421\u041C\u0418" }
      };
      const config = configs[action];
      if (!config || bal < config.cost || v.rugged) return;
      adjustAccountBalance(src, -config.cost);
      const success = Math.random() < config.successChance;
      const pop = success ? (config.popRange[0] + Math.random() * (config.popRange[1] - config.popRange[0])) * repFactor : Math.random() < 0.3 ? -Math.random() * 4 : 0;
      applyImpact(v.id, pop);
      flagLeveragedPumpPattern(v.id, pop);
      setCompanies((prev) => prev.map((c) => c.id === v.id ? { ...c, hypeLevel: (c.hypeLevel || 0) + 1, scamHeat: (c.scamHeat || 0) + config.heat } : c));
      setHypePosts((prev) => [{ id: makeId("post"), label: config.label, success, likes: success ? Math.round(40 + Math.random() * 400) : Math.round(Math.random() * 20), comments: success ? Math.round(5 + Math.random() * 60) : Math.round(Math.random() * 5) }, ...prev].slice(0, 6));
      pushPost({ id: makeId("news"), text: success ? `${v.ticker}: ${config.label} \u0432\u044B\u0441\u0442\u0440\u0435\u043B\u0438\u043B\u0430 \u2014 \u0446\u0435\u043D\u0430 \u0440\u0430\u0441\u0442\u0451\u0442` : `${v.ticker}: ${config.label} \u043D\u0435 \u0434\u0430\u043B\u0430 \u044D\u0444\u0444\u0435\u043A\u0442\u0430`, positive: success, isMacro: false, ticker: v.ticker });
    }
    setTimeout(saveGame, 50);
  };
  const takeJob = (companyId, positionId) => {
    const position = POSITIONS.find((p) => p.id === positionId);
    const shiftsAtCompany = jobHistory[companyId] || 0;
    if (!position || shiftsAtCompany < position.minShifts) return;
    setJob({ companyId, positionId });
    setJobCooldown(0);
    setTimeout(saveGame, 50);
  };
  const quitJob = () => {
    setJob(null);
    setJobCooldown(0);
    setTimeout(saveGame, 50);
  };
  const workShift = (taskId) => {
    if (!job || jobCooldown > 0) return;
    const position = POSITIONS.find((p) => p.id === job.positionId);
    const task = TASK_OPTIONS.find((t) => t.id === taskId) || TASK_OPTIONS[0];
    if (!position) return;
    let pay = position.salary * task.payMult;
    let outcomeText = null;
    if (task.risky) {
      const lucky = Math.random() < 0.5;
      pay = position.salary * (lucky ? 2.2 : 0.4);
      outcomeText = lucky ? `${position.name}: \u0441\u0440\u043E\u0447\u043D\u044B\u0439 \u043F\u0440\u043E\u0435\u043A\u0442 \u043F\u0440\u0438\u043D\u0451\u0441 \u043F\u0440\u0435\u043C\u0438\u044E` : `${position.name}: \u043A\u043B\u0438\u0435\u043D\u0442 \u043E\u0441\u0442\u0430\u043B\u0441\u044F \u043D\u0435\u0434\u043E\u0432\u043E\u043B\u0435\u043D \u2014 \u0437\u0430\u043F\u043B\u0430\u0442\u0438\u043B\u0438 \u043F\u043E \u043C\u0438\u043D\u0438\u043C\u0443\u043C\u0443`;
    }
    pay = Math.round(pay);
    adjustAccountBalance(resolvedPayFrom, pay);
    setJobHistory((h) => ({ ...h, [job.companyId]: (h[job.companyId] || 0) + 1 }));
    setJobCooldown(Math.round(position.cooldown * task.cooldownMult));
    accrueTax("\u041D\u0414\u0424\u041B \u0441 \u0437\u0430\u0440\u043F\u043B\u0430\u0442\u044B", Math.round(pay * 0.13));
    logTx(`\u0417\u0430\u0440\u043F\u043B\u0430\u0442\u0430 \xB7 ${position.name}`, pay, "in");
    if (outcomeText) pushPost({ text: outcomeText, positive: pay >= position.salary, isMacro: false });
    setTimeout(saveGame, 50);
  };
  const applyForLoan = (bankId) => {
    const bank = BANKS.find((b) => b.id === bankId);
    if (!bank) return;
    const amount = Math.round(Number(loanInputs[bankId] || 0));
    const setFb = (ok, msg) => setLoanFeedback((f) => ({ ...f, [bankId]: { ok, msg } }));
    if (loans.some((l) => l.bankId === bankId)) {
      setFb(false, "\u0423\u0436\u0435 \u0435\u0441\u0442\u044C \u0430\u043A\u0442\u0438\u0432\u043D\u044B\u0439 \u043A\u0440\u0435\u0434\u0438\u0442 \u0432 \u044D\u0442\u043E\u043C \u0431\u0430\u043D\u043A\u0435");
      return;
    }
    if (!amount || amount <= 0) {
      setFb(false, "\u0423\u043A\u0430\u0436\u0438 \u0441\u0443\u043C\u043C\u0443 \u043A\u0440\u0435\u0434\u0438\u0442\u0430");
      return;
    }
    if (netWorth < bank.minNetWorth) {
      setFb(false, `\u041D\u0443\u0436\u0435\u043D \u043A\u0430\u043F\u0438\u0442\u0430\u043B \u043E\u0442 ${fmt(bank.minNetWorth)}`);
      return;
    }
    const totalShifts = Object.values(jobHistory).reduce((a, b) => a + b, 0);
    if (bank.requiresExperience && totalShifts < 5) {
      setFb(false, "\u041D\u0443\u0436\u0435\u043D \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043D\u043D\u044B\u0439 \u043E\u043F\u044B\u0442 \u0440\u0430\u0431\u043E\u0442\u044B \u043E\u0442 5 \u0441\u043C\u0435\u043D");
      return;
    }
    const clientRating = bankRatings[bankId] ?? 50;
    const bankHealth = companyPerfPct(companies, bank.ticker);
    const acctForTurnover = bankAccounts[bankId];
    const turnoverGrowthMult = 1 + Math.min(1.5, (acctForTurnover && acctForTurnover.lifetimeTurnover || 0) / 15e3);
    const limit = bankLimit(bank, cash, netWorth, repFactor, clientRating, bankHealth, turnoverGrowthMult);
    if (amount > limit) {
      setFb(false, `\u041E\u0442\u043A\u0430\u0437: \u0441 \u0443\u0447\u0451\u0442\u043E\u043C \u0431\u0430\u043B\u0430\u043D\u0441\u0430, \u0430\u043A\u0442\u0438\u0432\u043E\u0432 \u0438 \u0442\u0432\u043E\u0435\u0439 \u0438\u0441\u0442\u043E\u0440\u0438\u0438 \u0432 \u044D\u0442\u043E\u043C \u0431\u0430\u043D\u043A\u0435 \u043C\u0430\u043A\u0441\u0438\u043C\u0443\u043C \u2248 ${fmt(limit)}`);
      return;
    }
    setLoans((prev) => [...prev, { id: makeId("loan"), bankId, principal: amount, balance: amount, ratePerTick: bank.ratePerTick * repRateMult * bankRatingRateMult(clientRating) * bankHealthRateMult(bankHealth), minPayment: Math.round(amount * 0.15), dueIn: DUE_CYCLE_SECONDS, paidThisCycle: false, frozen: false, seizedRecently: false }]);
    adjustAccountBalance(resolvedPayFrom, amount);
    setLoanInputs((f) => ({ ...f, [bankId]: "" }));
    setFb(true, `\u041E\u0434\u043E\u0431\u0440\u0435\u043D\u043E: ${fmt(amount)}`);
    logTx(`\u041A\u0440\u0435\u0434\u0438\u0442 \xB7 ${bank.name}`, amount, "in");
    setTimeout(saveGame, 50);
  };
  const repayLoan = (loanId, amount) => {
    const l = loans.find((x) => x.id === loanId);
    const src = resolvedPayFrom;
    const bal = src === "personal" ? cash : src === "grey" ? greyAccount?.balance || 0 : bankAccounts[src]?.balance || 0;
    if (!l || amount <= 0 || amount > bal) return;
    const newBalance = l.balance - amount;
    const metMin = amount >= l.minPayment;
    adjustAccountBalance(src, -amount);
    if (newBalance <= 0) {
      setLoans((prev) => prev.filter((x) => x.id !== loanId));
      adjustBankRating(l.bankId, l.seizedRecently ? 5 : 10);
    } else {
      const ratio = newBalance / l.principal;
      setLoans((prev) => prev.map((x) => x.id === loanId ? { ...x, balance: Number(newBalance.toFixed(2)), paidThisCycle: metMin ? true : x.paidThisCycle, frozen: ratio >= 1.5, seizedRecently: ratio < 1.5 ? false : x.seizedRecently } : x));
    }
    logTx("\u041F\u043B\u0430\u0442\u0451\u0436 \u043F\u043E \u043A\u0440\u0435\u0434\u0438\u0442\u0443", amount, "out");
    setTimeout(saveGame, 50);
  };
  const seizeForLoan = (loanId) => {
    const loan = loansRef.current.find((l) => l.id === loanId);
    if (!loan) return;
    const bank = BANKS.find((b) => b.id === loan.bankId);
    adjustBankRating(loan.bankId, -30, -10);
    const ventureId = playerVentureIdRef.current;
    if (ventureId) {
      const venture = companiesRef.current.find((c) => c.id === ventureId);
      setCompanies((prev) => prev.map((c) => c.id === ventureId ? { ...c, isPlayer: false, name: `${c.name} (\u043F\u043E\u0434 \u0443\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435\u043C \u0431\u0430\u043D\u043A\u0430)` } : c));
      setHoldings((h) => {
        const rest = { ...h };
        delete rest[ventureId];
        return rest;
      });
      setPlayerVentureId(null);
      setInvestorPersona(null);
      setLoans((prev) => prev.filter((l) => l.id !== loanId));
      pushPost({ text: `${bank?.name || "\u0411\u0430\u043D\u043A"} \u0438\u0437\u044A\u044F\u043B \xAB${venture?.ticker || "\u0431\u0438\u0437\u043D\u0435\u0441"}\xBB \u0437\u0430 \u0434\u043E\u043B\u0433\u0438 \u2014 \u043A\u043E\u043C\u043F\u0430\u043D\u0438\u044F \u043F\u0435\u0440\u0435\u0448\u043B\u0430 \u043F\u043E\u0434 \u0443\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u0431\u0430\u043D\u043A\u0430`, positive: false, isMacro: true, ticker: venture?.ticker });
    } else {
      const seized = Math.min(cashRef.current, loan.balance);
      setCash((c) => Math.max(0, c - seized));
      setLoans((prev) => prev.map((l) => l.id === loanId ? { ...l, balance: Math.max(0, Number((l.balance - seized).toFixed(2))) } : l));
      pushPost({ text: `${bank?.name || "\u0411\u0430\u043D\u043A"} \u0441\u043F\u0438\u0441\u0430\u043B ${fmt(seized)} \u0441\u043E \u0441\u0447\u0451\u0442\u0430 \u0437\u0430 \u043F\u0440\u043E\u0441\u0440\u043E\u0447\u043A\u0443 \u043F\u043E \u043A\u0440\u0435\u0434\u0438\u0442\u0443`, positive: false, isMacro: true });
    }
    setTimeout(saveGame, 50);
  };
  const payTax = (amount) => {
    const src = resolvedPayFrom;
    const bal = src === "personal" ? cash : src === "grey" ? greyAccount?.balance || 0 : bankAccounts[src]?.balance || 0;
    const pay = Math.min(amount, bal, taxOwed);
    if (pay <= 0) return;
    adjustAccountBalance(src, -pay);
    setTaxOwed((o) => Math.max(0, Number((o - pay).toFixed(2))));
    setTaxHistory((h) => [{ id: makeId("tax"), label: "\u041E\u043F\u043B\u0430\u0442\u0430 \u043D\u0430\u043B\u043E\u0433\u043E\u0432", amount: pay, kind: "payment" }, ...h].slice(0, 60));
    logTx("\u041E\u043F\u043B\u0430\u0442\u0430 \u043D\u0430\u043B\u043E\u0433\u043E\u0432", pay, "out");
    setTimeout(saveGame, 50);
  };
  const payFine = (fineId) => {
    const fine = fines.find((f) => f.id === fineId);
    const src = resolvedPayFrom;
    const bal = src === "personal" ? cash : src === "grey" ? greyAccount?.balance || 0 : bankAccounts[src]?.balance || 0;
    if (!fine || fine.paid || bal < fine.amount) return;
    adjustAccountBalance(src, -fine.amount);
    setFines((prev) => prev.filter((f) => f.id !== fineId));
    logTx(`\u0428\u0442\u0440\u0430\u0444 \xB7 ${fine.label}`, fine.amount, "out");
    setTimeout(saveGame, 50);
  };
  const buyBond = (bankId) => {
    const bank = BANK_ACCOUNTS.find((b) => b.id === bankId);
    const acct = bankAccounts[bankId];
    if (!bank || !acct || acct.frozen) return;
    const amount = Math.round(Number(bondInputs[bankId] || 0));
    if (!amount || amount <= 0 || amount > acct.balance) return;
    setBankAccounts((prev) => ({ ...prev, [bankId]: { ...prev[bankId], balance: prev[bankId].balance - amount, turnoverUsed: prev[bankId].turnoverUsed + amount, lifetimeTurnover: (prev[bankId].lifetimeTurnover || 0) + amount } }));
    setBonds((prev) => [...prev, { id: makeId("bond"), bankId, principal: amount, boughtAt: Date.now(), maturesAt: Date.now() + bank.bond.termSeconds * 1e3 }]);
    setBondInputs((f) => ({ ...f, [bankId]: "" }));
    logTx(`\u041F\u043E\u043A\u0443\u043F\u043A\u0430 \u043E\u0431\u043B\u0438\u0433\u0430\u0446\u0438\u0438 \xB7 ${bank.bond.name}`, amount, "out");
    setTimeout(saveGame, 50);
  };
  const redeemBond = (bondId) => {
    const bond = bonds.find((b) => b.id === bondId);
    if (!bond) return;
    const bank = BANK_ACCOUNTS.find((b) => b.id === bond.bankId);
    if (!bank) return;
    const matured = Date.now() >= bond.maturesAt;
    let payout;
    let label;
    if (matured) {
      const defaulted = bank.bond.risk > 0 && Math.random() < bank.bond.risk;
      payout = defaulted ? Math.round(bond.principal * 0.15) : Math.round(bond.principal * (1 + bank.bond.totalReturnPct / 100));
      label = defaulted ? `${bank.bond.name}: \u044D\u043C\u0438\u0442\u0435\u043D\u0442 \u043D\u0435 \u0440\u0430\u0441\u043F\u043B\u0430\u0442\u0438\u043B\u0441\u044F \u043F\u043E\u043B\u043D\u043E\u0441\u0442\u044C\u044E` : `${bank.bond.name}: \u043E\u0431\u043B\u0438\u0433\u0430\u0446\u0438\u044F \u043F\u043E\u0433\u0430\u0448\u0435\u043D\u0430 \u0441 \u0434\u043E\u0445\u043E\u0434\u043E\u043C`;
    } else {
      payout = Math.round(bond.principal * 0.9);
      label = `${bank.bond.name}: \u0434\u043E\u0441\u0440\u043E\u0447\u043D\u043E\u0435 \u043F\u043E\u0433\u0430\u0448\u0435\u043D\u0438\u0435 \u0441 \u043F\u043E\u0442\u0435\u0440\u0435\u0439 \u0447\u0430\u0441\u0442\u0438 \u043D\u043E\u043C\u0438\u043D\u0430\u043B\u0430`;
    }
    adjustAccountBalance(bond.bankId, payout);
    setBonds((prev) => prev.filter((b) => b.id !== bondId));
    pushPost({ text: label, positive: matured && payout >= bond.principal, isMacro: false });
    logTx(`\u041F\u043E\u0433\u0430\u0448\u0435\u043D\u0438\u0435 \u043E\u0431\u043B\u0438\u0433\u0430\u0446\u0438\u0438 \xB7 ${bank.bond.name}`, payout, "in");
    setTimeout(saveGame, 50);
  };
  const resolvedPayFrom = (() => {
    const valid = (id) => id === "personal" ? cash > 0 : id === "grey" ? !!(greyAccount && !greyAccount.frozen) : !!(bankAccounts[id] && !bankAccounts[id].frozen);
    if (valid(payFromAccount)) return payFromAccount;
    const firstBank = BANK_ACCOUNTS.find((b) => bankAccounts[b.id] && !bankAccounts[b.id].frozen);
    if (firstBank) return firstBank.id;
    if (cash > 0) return "personal";
    if (greyAccount && !greyAccount.frozen) return "grey";
    return payFromAccount;
  })();
  const buyItem = (itemId) => {
    const item = SHOP_ITEMS.find((i) => i.id === itemId);
    if (!item) return;
    const src = resolvedPayFrom;
    const bal = src === "personal" ? cash : src === "grey" ? greyAccount?.balance || 0 : bankAccounts[src]?.balance || 0;
    if (bal < item.price) return;
    adjustAccountBalance(src, -item.price);
    setOwnedItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
    logTx(`\u041F\u043E\u043A\u0443\u043F\u043A\u0430 \xB7 ${item.name}`, item.price, "out");
    setTimeout(saveGame, 50);
  };
  const sellItem = (itemId) => {
    const item = SHOP_ITEMS.find((i) => i.id === itemId);
    const qty = ownedItems[itemId] || 0;
    if (!item || qty <= 0) return;
    const proceeds = Math.round(item.price * 0.65);
    adjustAccountBalance(resolvedPayFrom, proceeds);
    setOwnedItems((prev) => ({ ...prev, [itemId]: qty - 1 }));
    logTx(`\u041F\u0440\u043E\u0434\u0430\u0436\u0430 \xB7 ${item.name}`, proceeds, "in");
    setTimeout(saveGame, 50);
  };
  const resetGame = () => {
    engineRef.current = {};
    setCash(0);
    setOnboarded(false);
    setHoldings({});
    setIpHoldings({});
    setPlayerVentureId(null);
    setInvestorPersona(null);
    setCompanies(seedCompanies());
    setFeedPosts([]);
    pendingBufferRef.current = [];
    setPendingCount(0);
    setPendingRumors([]);
    setNetWorthHistory([]);
    setLoans([]);
    setJob(null);
    setJobHistory({});
    setJobCooldown(0);
    setTaxOwed(0);
    setTaxOverdueSeconds(0);
    setTaxHistory([]);
    setFines([]);
    setTransactions([]);
    setHypePosts([]);
    setConfirmCloseVenture(false);
    setBonds([]);
    setBondInputs({});
    setOwnedItems({});
    setLeveragedPositions([]);
    setTradeLeverage(1);
    setResellShops([]);
    setOrderQtyInputs({});
    setOrderCategorySel({});
    setListedPriceInputs({});
    setBizPath(null);
    setSelectedBizId(null);
    setConfirmCloseResell(null);
    setConfirmCloseOffline(null);
    setIpCash(0);
    setIpTaxOwed(0);
    setQuarterRevenue(0);
    setQuarterEndsAt(Date.now() + QUARTER_MS);
    setDeclarations([]);
    setIpLoans([]);
    setIpLoanInput("");
    setIpLoanFeedback(null);
    setIpTransferInput("");
    setMarketIndex(1);
    setIpTab("account");
    const newCard = String(Math.floor(1e3 + Math.random() * 9e3));
    setCardLast4(newCard);
    setSuspicion(0);
    setBankRatings({ mfo: 50, priv: 50, fed: 50 });
    setIpBankRating(50);
    setReputation(100);
    setBankAccounts({});
    setTransferSuspicion(0);
    setLastLargeTransferBank(null);
    setBankTransferInputs({});
    setBankTransferFeedback({});
    setBankTransferDest({});
    setGreyAccount(null);
    setGreyHoldings({});
    setGreySuspicion(0);
    setGreyTransferInput("");
    setGreyTransferDest("personal");
    setGreyFeedback(null);
    setBlackMarketRound(null);
    setBlackMarketVolume(0);
    setBlackMarketHeat(0);
    setBlackMarketRoundsDone(0);
    setMuleCards({});
    setMuleTransferInputs({});
    setMuleTransferDest({});
    setMuleFeedback({});
    setIpTurnoverUsed(0);
    setIpTurnoverResetAt(Date.now() + TURNOVER_RESET_MS);
    setBlackMarketOffers([]);
    setLoanInputs({});
    setLoanFeedback({});
    setConfirmReset(false);
    window.storage.set(STORAGE_KEY, JSON.stringify({ cash: 0, onboarded: false, holdings: {}, playerVentureId: null, companies: [], loans: [], job: null, jobHistory: {}, taxOwed: 0, taxHistory: [], fines: [], cardLast4: newCard, suspicion: 0, reputation: 100, bonds: [], ownedItems: {}, leveragedPositions: [], resellShops: [], ipCash: 0, ipTaxOwed: 0, quarterRevenue: 0, quarterEndsAt: Date.now() + QUARTER_MS, declarations: [], ipLoans: [], marketIndex: 1, bankAccounts: {}, transferSuspicion: 0, greyAccount: null, greyHoldings: {}, greySuspicion: 0, blackMarketVolume: 0, blackMarketHeat: 0, blackMarketRoundsDone: 0, blackMarketRound: null, ipTurnoverUsed: 0, ipTurnoverResetAt: Date.now() + TURNOVER_RESET_MS })).catch(() => {
    });
  };
  const bondsValue = bonds.reduce((sum, b) => {
    const bank = BANK_ACCOUNTS.find((x) => x.id === b.bankId);
    if (!bank) return sum;
    const elapsed = Math.min(1, (Date.now() - b.boughtAt) / (bank.bond.termSeconds * 1e3));
    return sum + b.principal * (1 + bank.bond.totalReturnPct / 100 * elapsed);
  }, 0);
  const itemsValue = Object.entries(ownedItems).reduce((sum, [itemId, qty]) => {
    const item = SHOP_ITEMS.find((i) => i.id === itemId);
    return sum + (item ? item.price * 0.65 * qty : 0);
  }, 0);
  const leverageValue = leveragedPositions.reduce((sum, p) => {
    const c = companies.find((x) => x.id === p.companyId);
    const price = c ? c.price : p.entryPrice;
    return sum + Math.max(0, p.margin + (price - p.entryPrice) * p.qty);
  }, 0);
  const ipHoldingsValue = Object.entries(ipHoldings).reduce((sum, [cid, h]) => {
    const c = companies.find((x) => x.id === cid);
    return sum + (c ? c.price * h.qty : 0);
  }, 0);
  const shopStockValue = resellShops.reduce((sum, s) => sum + Object.values(s.categories || {}).reduce((cs, c) => cs + c.stock * c.avgCost, 0), 0);
  const bankAccountsValue = Object.values(bankAccounts).reduce((sum, a) => sum + a.balance, 0);
  const muleCardsValue = Object.values(muleCards).reduce((sum, c) => sum + c.balance, 0);
  const greyBalance = greyAccount ? greyAccount.balance : 0;
  const greyHoldingsValue = Object.entries(greyHoldings).reduce((sum, [cid, h]) => {
    const c = companies.find((x) => x.id === cid);
    return sum + (c ? c.price * h.qty : 0);
  }, 0);
  const netWorth = cash + bankAccountsValue + greyBalance + greyHoldingsValue + muleCardsValue + ipCash + ipHoldingsValue + shopStockValue + Object.entries(holdings).reduce((sum, [cid, h]) => {
    const c = companies.find((x) => x.id === cid);
    return sum + (c ? c.price * h.qty : 0);
  }, 0) + bondsValue + itemsValue + leverageValue;
  const playerVenture = companies.find((c) => c.id === playerVentureId) || null;
  const selectedCompany = companies.find((c) => c.id === selectedId) || null;
  const jobCompany = job ? companies.find((c) => c.id === job.companyId) : null;
  const jobPosition = job ? POSITIONS.find((p) => p.id === job.positionId) : null;
  const marketingCost = playerVenture ? Math.round(800 * Math.pow(1.5, playerVenture.marketingLevel || 0)) : 0;
  const resolvedBal = resolvedPayFrom === "personal" ? cash : resolvedPayFrom === "grey" ? greyAccount?.balance || 0 : bankAccounts[resolvedPayFrom]?.balance || 0;
  const rdCost = playerVenture ? Math.round(1200 * Math.pow(1.4, playerVenture.rdLevel || 0)) : 0;
  const hypeSocialCost = playerVenture ? Math.round(150 * Math.pow(1.35, playerVenture.hypeLevel || 0)) : 0;
  const hypeBloggerCost = playerVenture ? Math.round(500 * Math.pow(1.3, playerVenture.hypeLevel || 0)) : 0;
  const hypePRCost = playerVenture ? Math.round(1200 * Math.pow(1.25, playerVenture.hypeLevel || 0)) : 0;
  const ventureFollowers = playerVenture ? Math.round(150 + (playerVenture.marketingLevel || 0) * 280 + (playerVenture.hypeLevel || 0) * 180 + (playerVenture.rdLevel || 0) * 120 + (playerVenture.investorRounds || 0) * 400) : 0;
  const venturePosts = playerVenture ? (playerVenture.marketingLevel || 0) + (playerVenture.rdLevel || 0) + (playerVenture.hypeLevel || 0) : 0;
  const founderHolding = playerVenture ? holdings[playerVenture.id] : null;
  const tradeAccountResolved = tradeAccount === "personal" && cash <= 0 ? BANK_ACCOUNTS.find((b) => bankAccounts[b.id] && !bankAccounts[b.id].frozen)?.id || "personal" : tradeAccount;
  const tradeIsIp = tradeAccountResolved === "ip" && selectedCompany?.sector === "\u041A\u0440\u0438\u043F\u0442\u043E";
  const tradeIsGrey = tradeAccountResolved === "grey" && !!greyAccount && !greyAccount.frozen;
  const tradeIsBankCard = !tradeIsIp && !tradeIsGrey && BANK_ACCOUNTS.some((b) => b.id === tradeAccountResolved) && !!bankAccounts[tradeAccountResolved] && !bankAccounts[tradeAccountResolved].frozen;
  const tradeIsMule = !tradeIsIp && !tradeIsGrey && !tradeIsBankCard && !!muleCards[tradeAccountResolved] && !muleCards[tradeAccountResolved].frozen;
  const selectedHeld = selectedCompany ? (tradeIsGrey ? greyHoldings : tradeIsIp ? ipHoldings : holdings)[selectedCompany.id]?.qty || 0 : 0;
  const tradeAvailableCash = tradeIsGrey ? greyAccount.balance : tradeIsIp ? ipCash : tradeIsBankCard ? bankAccounts[tradeAccountResolved].balance : tradeIsMule ? muleCards[tradeAccountResolved].balance : cash;
  const assetsFrozen = !tradeIsIp && !tradeIsGrey && loans.some((l) => l.frozen);
  const tabTitle = { market: "\u0420\u044B\u043D\u043E\u043A", news: "\u0421\u043E\u0446\u0441\u0435\u0442\u044C", job: "\u0420\u0430\u0431\u043E\u0442\u0430", inspection: "\u0418\u041F", company: "\u041C\u043E\u0439 \u0431\u0438\u0437\u043D\u0435\u0441", darkshop: "\u0414\u0430\u0440\u043A\u043D\u0435\u0442", cabinet: "\u041A\u0430\u0431\u0438\u043D\u0435\u0442" }[activeTab];
  return /* @__PURE__ */ jsxs("div", { style: { height: "100vh", background: C.bg, display: "flex", justifyContent: "center", overflow: "hidden" }, children: [
    /* @__PURE__ */ jsx("style", { children: `
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;}
        button{font-family:inherit;cursor:pointer;}
        input{font-family:inherit;}
        button:focus-visible, input:focus-visible{outline:2px solid ${C.gold};outline-offset:2px;}
        @keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
        ::-webkit-scrollbar{width:0;height:0;}
      ` }),
    /* @__PURE__ */ jsx("div", { style: { width: "100%", maxWidth: 430, height: "100%", display: "flex", flexDirection: "column", overflow: "hidden", background: C.bg, color: C.ink, fontFamily: "'Space Grotesk', system-ui, sans-serif" }, children: !loaded ? /* @__PURE__ */ jsx("div", { style: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }, children: /* @__PURE__ */ jsx("div", { style: { color: C.inkDim, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, letterSpacing: 1 }, children: "\u0417\u0410\u0413\u0420\u0423\u0417\u041A\u0410 \u0420\u042B\u041D\u041A\u0410\u2026" }) }) : !onboarded ? /* @__PURE__ */ jsxs("div", { style: { flex: 1, overflowY: "auto", padding: "24px 20px" }, children: [
      /* @__PURE__ */ jsxs("div", { style: { textAlign: "center", marginBottom: 24 }, children: [
        /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: C.inkDim, letterSpacing: 1.5, textTransform: "uppercase" }, children: "\u041F\u0435\u0441\u043E\u0447\u043D\u0438\u0446\u0430 \u0440\u044B\u043D\u043A\u0430" }),
        /* @__PURE__ */ jsx("div", { style: { fontSize: 22, fontWeight: 700, marginTop: 6 }, children: "\u041E\u0442\u043A\u0440\u043E\u0439 \u0441\u0432\u043E\u0439 \u043F\u0435\u0440\u0432\u044B\u0439 \u0431\u0430\u043D\u043A" }),
        /* @__PURE__ */ jsxs("div", { style: { fontSize: 13, color: C.inkDim, marginTop: 8, lineHeight: 1.5 }, children: [
          "\u0421\u0442\u0430\u0440\u0442\u043E\u0432\u044B\u0435 ",
          fmt(1e3),
          " \u043B\u044F\u0433\u0443\u0442 \u043D\u0430 \u043A\u0430\u0440\u0442\u0443 \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u043E\u0433\u043E \u0431\u0430\u043D\u043A\u0430 \u2014 \u0431\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u043E, \u0431\u0435\u0437 \u0430\u043D\u043E\u043D\u0438\u043C\u043D\u043E\u0433\u043E \u043A\u043E\u0448\u0435\u043B\u044C\u043A\u0430. \u041E\u0441\u0442\u0430\u043B\u044C\u043D\u044B\u0435 \u0431\u0430\u043D\u043A\u0438 \u043C\u043E\u0436\u043D\u043E \u043E\u0442\u043A\u0440\u044B\u0442\u044C \u043F\u043E\u0437\u0436\u0435."
        ] })
      ] }),
      BANK_ACCOUNTS.map((b) => {
        const health = companyPerfPct(companies, b.ticker);
        return /* @__PURE__ */ jsxs("button", { onClick: () => completeOnboarding(b.id), style: { width: "100%", textAlign: "left", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 12 }, children: [
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ jsx("div", { style: { fontWeight: 700, fontSize: 15 }, children: b.name }),
            /* @__PURE__ */ jsxs("div", { style: { fontSize: 11, color: health >= 0 ? C.green : C.red }, children: [
              b.ticker,
              " ",
              health >= 0 ? "+" : "",
              health.toFixed(1),
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { style: { fontSize: 12, color: C.inkDim, marginTop: 6 }, children: [
            b.cardName,
            " \xB7 \u043B\u0438\u043C\u0438\u0442 \u043D\u0430 \u043F\u0435\u0440\u0435\u0432\u043E\u0434 ",
            fmt(b.singleLimit),
            " \xB7 \u043E\u0431\u043E\u0440\u043E\u0442 ",
            fmt(b.turnoverCap),
            "/4\u0447"
          ] })
        ] }, b.id);
      })
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 6px" }, children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: C.inkDim, letterSpacing: 1.5, textTransform: "uppercase" }, children: "\u041F\u0435\u0441\u043E\u0447\u043D\u0438\u0446\u0430 \u0440\u044B\u043D\u043A\u0430" }),
          /* @__PURE__ */ jsx("div", { style: { fontSize: 20, fontWeight: 700 }, children: tabTitle })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8 }, children: [
          /* @__PURE__ */ jsx("button", { onClick: () => setShowBackupModal(true), style: { background: "none", border: `1px solid ${C.border}`, borderRadius: 8, padding: 8, color: C.inkDim }, children: /* @__PURE__ */ jsx(Save, { size: 16 }) }),
          /* @__PURE__ */ jsx("button", { onClick: () => setConfirmReset(true), style: { background: "none", border: `1px solid ${C.border}`, borderRadius: 8, padding: 8, color: C.inkDim }, children: /* @__PURE__ */ jsx(RotateCcw, { size: 16 }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", padding: "0 16px 4px", fontSize: 12.5 }, children: [
        /* @__PURE__ */ jsxs("div", { style: { fontFamily: "'JetBrains Mono', monospace", color: C.inkDim }, children: [
          "\u0424\u0438\u0437: ",
          /* @__PURE__ */ jsx("b", { style: { color: C.ink }, children: fmt(cash + bankAccountsValue + greyBalance) }),
          (ipCash > 0 || resellShops.length > 0) && /* @__PURE__ */ jsxs("span", { children: [
            " \xB7 \u0418\u041F: ",
            /* @__PURE__ */ jsx("b", { style: { color: C.ink }, children: fmt(ipCash) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: { color: C.inkDim }, children: [
          taxOwed > 0 && /* @__PURE__ */ jsxs("span", { style: { color: C.red }, children: [
            "\u041D\u0430\u043B\u043E\u0433 ",
            fmt(taxOwed)
          ] }),
          suspicion > 40 ? /* @__PURE__ */ jsx("span", { style: { color: C.red }, children: " \xB7 \u0432\u043D\u0438\u043C\u0430\u043D\u0438\u0435 \u0438\u043D\u0441\u043F\u0435\u043A\u0446\u0438\u0438: \u0432\u044B\u0441\u043E\u043A\u043E\u0435" }) : suspicion > 15 ? /* @__PURE__ */ jsx("span", { style: { color: C.gold }, children: " \xB7 \u0432\u043D\u0438\u043C\u0430\u043D\u0438\u0435 \u0438\u043D\u0441\u043F\u0435\u043A\u0446\u0438\u0438: \u043F\u043E\u0432\u044B\u0448\u0435\u043D\u043E" }) : null
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { padding: "0 16px 10px", fontSize: 11.5, color: C.inkFaint }, children: [
        "\u0420\u0435\u043F\u0443\u0442\u0430\u0446\u0438\u044F: ",
        /* @__PURE__ */ jsx("b", { style: { color: reputation >= 70 ? C.green : reputation >= 40 ? C.gold : C.red }, children: Math.round(reputation) })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { flex: 1, overflowY: "auto", padding: "8px 16px 16px" }, onTouchStart: handleFeedTouchStart, onTouchMove: handleFeedTouchMove, onTouchEnd: handleFeedTouchEnd, children: [
        activeTab === "market" && /* @__PURE__ */ jsx("div", { children: companies.map((c) => /* @__PURE__ */ jsx(CompanyRow, { c, onClick: () => {
          setSelectedId(c.id);
          setTradeSide("buy");
          setTradeQty(1);
          setTradeLeverage(1);
          setTradeAccount("personal");
          setTradeQtyMode("qty");
          setTradeAmountInput("");
        } }, c.id)) }),
        activeTab === "news" && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { style: { height: refreshing ? 40 : pullY, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", transition: pullY === 0 ? "height 0.2s" : "none", color: C.inkDim, fontSize: 11.5 }, children: [
            /* @__PURE__ */ jsx(RefreshCw, { size: 14, style: { marginRight: 6, animation: refreshing ? "spin 0.7s linear infinite" : "none", transform: !refreshing && pullY > 46 ? "rotate(180deg)" : "none", transition: "transform 0.15s" } }),
            refreshing ? "\u041E\u0431\u043D\u043E\u0432\u043B\u044F\u0435\u043C \u043B\u0435\u043D\u0442\u0443\u2026" : pullY > 46 ? "\u041E\u0442\u043F\u0443\u0441\u0442\u0438, \u0447\u0442\u043E\u0431\u044B \u043E\u0431\u043D\u043E\u0432\u0438\u0442\u044C" : "\u041F\u043E\u0442\u044F\u043D\u0438 \u0432\u043D\u0438\u0437, \u0447\u0442\u043E\u0431\u044B \u043E\u0431\u043D\u043E\u0432\u0438\u0442\u044C"
          ] }),
          /* @__PURE__ */ jsxs("button", { onClick: refreshFeed, disabled: refreshing, style: { width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: pendingCount > 0 ? `${C.gold}18` : C.surface, border: `1px solid ${pendingCount > 0 ? C.gold + "55" : C.border}`, color: pendingCount > 0 ? C.gold : C.inkDim, borderRadius: 10, padding: 9, fontSize: 12, fontWeight: 600, marginBottom: 12 }, children: [
            /* @__PURE__ */ jsx(RefreshCw, { size: 13, style: { animation: refreshing ? "spin 0.7s linear infinite" : "none" } }),
            " ",
            pendingCount > 0 ? `${pendingCount} \u043D\u043E\u0432\u044B\u0445 \u043F\u043E\u0441\u0442\u043E\u0432 \u2014 \u043F\u043E\u043A\u0430\u0437\u0430\u0442\u044C` : "\u041F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F"
          ] }),
          viewingCompanyId ? (() => {
            const vc = companies.find((c) => c.id === viewingCompanyId);
            if (!vc) return null;
            const vcOpen = vc.candles && vc.candles[0] ? vc.candles[0].o : vc.price;
            const vcChange = (vc.price - vcOpen) / vcOpen * 100;
            const vcPosts = feedPosts.filter((p) => p.ticker === vc.ticker);
            return /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("button", { onClick: () => setViewingCompanyId(null), style: { background: "none", border: "none", color: C.inkDim, fontSize: 12.5, marginBottom: 12, padding: 0 }, children: "\u2190 \u041D\u0430\u0437\u0430\u0434 \u043A \u043B\u0435\u043D\u0442\u0435" }),
              /* @__PURE__ */ jsx("div", { style: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16, marginBottom: 16 }, children: /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 12 }, children: [
                /* @__PURE__ */ jsx("div", { style: { width: 44, height: 44, borderRadius: "50%", background: `${vc.rugged ? C.red : C.gold}22`, color: vc.rugged ? C.red : C.gold, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 }, children: vc.ticker.slice(0, 2) }),
                /* @__PURE__ */ jsxs("div", { style: { minWidth: 0, flex: 1 }, children: [
                  /* @__PURE__ */ jsx("div", { style: { fontWeight: 700, fontSize: 15 }, children: vc.name }),
                  /* @__PURE__ */ jsxs("div", { style: { fontSize: 12, color: C.inkDim }, children: [
                    "@",
                    vc.ticker,
                    " \xB7 ",
                    vc.sector,
                    vc.isPlayer ? " \xB7 \u0442\u0432\u043E\u044F" : ""
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { style: { textAlign: "right" }, children: [
                  /* @__PURE__ */ jsx("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700 }, children: fmt(vc.price) }),
                  /* @__PURE__ */ jsxs("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: vcChange >= 0 ? C.green : C.red }, children: [
                    vcChange >= 0 ? "+" : "",
                    vcChange.toFixed(1),
                    "%"
                  ] })
                ] })
              ] }) }),
              /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: C.inkDim, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }, children: "\u041F\u043E\u0441\u0442\u044B" }),
              vcPosts.length === 0 && /* @__PURE__ */ jsxs("div", { style: { color: C.inkFaint, fontSize: 13, padding: "30px 0", textAlign: "center" }, children: [
                "\u041F\u043E\u043A\u0430 \u043D\u0438\u0447\u0435\u0433\u043E \u043D\u0435 \u043F\u0438\u0441\u0430\u043B\u0438 \u043F\u0440\u043E ",
                vc.ticker
              ] }),
              vcPosts.map((post) => {
                const author = authorFor(post);
                const eng = engagementFor(post);
                return /* @__PURE__ */ jsx("div", { style: { borderBottom: `1px solid ${C.border}`, padding: "12px 2px" }, children: /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 10 }, children: [
                  /* @__PURE__ */ jsx("div", { style: { width: 36, height: 36, borderRadius: "50%", background: `${author.color}22`, color: author.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0 }, children: author.name.slice(0, 1) }),
                  /* @__PURE__ */ jsxs("div", { style: { minWidth: 0, flex: 1 }, children: [
                    /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 5, fontSize: 13 }, children: [
                      /* @__PURE__ */ jsx("span", { style: { fontWeight: 700 }, children: author.name }),
                      author.verified && /* @__PURE__ */ jsx("span", { style: { color: C.gold, fontSize: 11 }, children: "\u2713" }),
                      /* @__PURE__ */ jsx("span", { style: { color: C.inkFaint, fontSize: 12 }, children: author.handle })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { style: { fontSize: 13.5, color: C.ink, marginTop: 3, lineHeight: 1.4 }, children: [
                      post.isMacro ? "\u{1F6A8} " : !post.positive ? "\u{1F4C9} " : "\u{1F4C8} ",
                      post.text
                    ] }),
                    /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 18, marginTop: 8, fontSize: 11.5, color: C.inkFaint }, children: [
                      /* @__PURE__ */ jsxs("span", { style: { display: "flex", alignItems: "center", gap: 4 }, children: [
                        /* @__PURE__ */ jsx(Heart, { size: 12 }),
                        " ",
                        eng.likes.toLocaleString()
                      ] }),
                      /* @__PURE__ */ jsxs("span", { style: { display: "flex", alignItems: "center", gap: 4 }, children: [
                        /* @__PURE__ */ jsx(MessageSquare, { size: 12 }),
                        " ",
                        eng.reposts.toLocaleString()
                      ] })
                    ] })
                  ] })
                ] }) }, post.id);
              })
            ] });
          })() : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: C.inkDim, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }, children: "\u041A\u043E\u043C\u043F\u0430\u043D\u0438\u0438 \u043D\u0430 \u0431\u0438\u0440\u0436\u0435" }),
            /* @__PURE__ */ jsx("div", { style: { display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4, marginBottom: 16 }, children: companies.map((c) => /* @__PURE__ */ jsxs("button", { onClick: () => setViewingCompanyId(c.id), style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 5, background: "none", border: "none", flexShrink: 0, width: 56 }, children: [
              /* @__PURE__ */ jsx("div", { style: { width: 46, height: 46, borderRadius: "50%", background: `${c.rugged ? C.red : c.isPlayer ? C.gold : C.surface2}${c.isPlayer || c.rugged ? "22" : ""}`, border: c.isPlayer ? `1px solid ${c.rugged ? C.red : C.gold}` : `1px solid ${C.border}`, color: c.rugged ? C.red : c.isPlayer ? C.gold : C.inkDim, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12 }, children: c.ticker.slice(0, 2) }),
              /* @__PURE__ */ jsx("div", { style: { fontSize: 10, color: C.inkDim, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%" }, children: c.ticker })
            ] }, c.id)) }),
            playerVenture ? /* @__PURE__ */ jsxs("div", { style: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16, marginBottom: 16 }, children: [
              /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 12 }, children: [
                /* @__PURE__ */ jsx("div", { style: { width: 44, height: 44, borderRadius: "50%", background: `${C.gold}22`, color: playerVenture.rugged ? C.red : C.gold, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 }, children: playerVenture.ticker.slice(0, 2) }),
                /* @__PURE__ */ jsxs("div", { style: { minWidth: 0 }, children: [
                  /* @__PURE__ */ jsx("div", { style: { fontWeight: 700, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }, children: playerVenture.name }),
                  /* @__PURE__ */ jsxs("div", { style: { fontSize: 12, color: C.inkDim }, children: [
                    "@",
                    playerVenture.ticker
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { style: { fontSize: 12.5, color: C.inkDim, margin: "10px 0", lineHeight: 1.5 }, children: playerVenture.kind === "crypto" ? playerVenture.strategy === "scam" ? "\u041A\u0440\u0438\u043F\u0442\u043E-\u043F\u0440\u043E\u0435\u043A\u0442 \xB7 \u0440\u0430\u0437\u0433\u043E\u043D \u043D\u0430 \u0445\u0430\u0439\u043F\u0435 \u{1F680}" : "\u041A\u0440\u0438\u043F\u0442\u043E-\u043F\u0440\u043E\u0435\u043A\u0442 \xB7 \u0447\u0435\u0441\u0442\u043D\u0430\u044F \u0440\u0430\u0437\u0440\u0430\u0431\u043E\u0442\u043A\u0430" : `\u041A\u043E\u043C\u043F\u0430\u043D\u0438\u044F \xB7 ${playerVenture.sector}` }),
              /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 16, fontSize: 12, color: C.inkDim, marginBottom: 12 }, children: [
                /* @__PURE__ */ jsxs("span", { children: [
                  /* @__PURE__ */ jsx("b", { style: { color: C.ink }, children: ventureFollowers.toLocaleString() }),
                  " \u043F\u043E\u0434\u043F\u0438\u0441\u0447\u0438\u043A\u043E\u0432"
                ] }),
                /* @__PURE__ */ jsxs("span", { children: [
                  /* @__PURE__ */ jsx("b", { style: { color: C.ink }, children: venturePosts }),
                  " \u043F\u043E\u0441\u0442\u043E\u0432"
                ] }),
                /* @__PURE__ */ jsxs("span", { children: [
                  /* @__PURE__ */ jsx("b", { style: { color: C.ink }, children: playerVenture.investorRounds || 0 }),
                  " \u0440\u0430\u0443\u043D\u0434\u043E\u0432"
                ] })
              ] }),
              !playerVenture.rugged && /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8 }, children: [
                /* @__PURE__ */ jsx("button", { onClick: () => investInVenture(playerVenture.kind === "crypto" && playerVenture.strategy === "scam" ? "hypeSocial" : "marketing"), style: { flex: 1, padding: 10, borderRadius: 10, border: "none", fontWeight: 700, fontSize: 12.5, background: C.gold, color: "#161207" }, children: "\u041E\u043F\u0443\u0431\u043B\u0438\u043A\u043E\u0432\u0430\u0442\u044C \u043F\u043E\u0441\u0442" }),
                /* @__PURE__ */ jsx("button", { onClick: () => setActiveTab("company"), disabled: (playerVenture.investorCooldown || 0) > 0, style: { flex: 1, padding: 10, borderRadius: 10, border: "none", fontWeight: 700, fontSize: 12.5, background: (playerVenture.investorCooldown || 0) > 0 ? C.surface2 : C.green, color: (playerVenture.investorCooldown || 0) > 0 ? C.inkFaint : "#06210f" }, children: (playerVenture.investorCooldown || 0) > 0 ? `\u0416\u0434\u0451\u043C\u2026 ${playerVenture.investorCooldown}\u0441` : "\u041F\u0438\u0442\u0447 \u0432\u043E \u0432\u043A\u043B\u0430\u0434\u043A\u0435 \xAB\u0411\u0438\u0437\u043D\u0435\u0441\xBB" })
              ] })
            ] }) : /* @__PURE__ */ jsx("div", { style: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 16, textAlign: "center" }, children: /* @__PURE__ */ jsx("div", { style: { fontSize: 13, color: C.inkDim }, children: "\u0417\u0430\u0432\u0435\u0434\u0438 \u0431\u0438\u0437\u043D\u0435\u0441 \u0432\u043E \u0432\u043A\u043B\u0430\u0434\u043A\u0435 \xAB\u0411\u0438\u0437\u043D\u0435\u0441\xBB, \u0447\u0442\u043E\u0431\u044B \u043F\u043E\u043B\u0443\u0447\u0438\u0442\u044C \u0442\u0443\u0442 \u043F\u0440\u043E\u0444\u0438\u043B\u044C \u0438 \u043F\u0440\u0438\u0432\u043B\u0435\u043A\u0430\u0442\u044C \u043F\u043E\u0434\u043F\u0438\u0441\u0447\u0438\u043A\u043E\u0432 \u0438 \u0438\u043D\u0432\u0435\u0441\u0442\u043E\u0440\u043E\u0432" }) }),
            feedPosts.length === 0 && pendingCount === 0 && /* @__PURE__ */ jsx("div", { style: { color: C.inkFaint, fontSize: 13, padding: "30px 0", textAlign: "center" }, children: "\u041B\u0435\u043D\u0442\u0430 \u043F\u0443\u0441\u0442\u0430 \u2014 \u043F\u043E\u0442\u044F\u043D\u0438 \u0432\u043D\u0438\u0437, \u0447\u0442\u043E\u0431\u044B \u043F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F" }),
            feedPosts.map((post) => {
              const author = authorFor(post);
              const eng = engagementFor(post);
              const relatedCompany = post.ticker ? companies.find((c) => c.ticker === post.ticker) : null;
              return /* @__PURE__ */ jsx("div", { style: { borderBottom: `1px solid ${C.border}`, padding: "12px 2px" }, children: /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 10 }, children: [
                /* @__PURE__ */ jsx("div", { style: { width: 36, height: 36, borderRadius: "50%", background: `${author.color}22`, color: author.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0 }, children: author.name.slice(0, 1) }),
                /* @__PURE__ */ jsxs("div", { style: { minWidth: 0, flex: 1 }, children: [
                  /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 5, fontSize: 13 }, children: [
                    /* @__PURE__ */ jsx("span", { style: { fontWeight: 700 }, children: author.name }),
                    author.verified && /* @__PURE__ */ jsx("span", { style: { color: C.gold, fontSize: 11 }, children: "\u2713" }),
                    /* @__PURE__ */ jsx("span", { style: { color: C.inkFaint, fontSize: 12 }, children: author.handle })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { style: { fontSize: 13.5, color: C.ink, marginTop: 3, lineHeight: 1.4 }, children: [
                    post.isMacro ? "\u{1F6A8} " : !post.positive ? "\u{1F4C9} " : "\u{1F4C8} ",
                    post.text
                  ] }),
                  /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 18, marginTop: 8, fontSize: 11.5, color: C.inkFaint, alignItems: "center" }, children: [
                    /* @__PURE__ */ jsxs("span", { style: { display: "flex", alignItems: "center", gap: 4 }, children: [
                      /* @__PURE__ */ jsx(Heart, { size: 12 }),
                      " ",
                      eng.likes.toLocaleString()
                    ] }),
                    /* @__PURE__ */ jsxs("span", { style: { display: "flex", alignItems: "center", gap: 4 }, children: [
                      /* @__PURE__ */ jsx(MessageSquare, { size: 12 }),
                      " ",
                      eng.reposts.toLocaleString()
                    ] }),
                    relatedCompany && /* @__PURE__ */ jsxs("button", { onClick: () => setViewingCompanyId(relatedCompany.id), style: { background: "none", border: "none", color: C.gold, fontSize: 11.5, fontWeight: 600, padding: 0 }, children: [
                      "@",
                      relatedCompany.ticker,
                      " \u2192"
                    ] })
                  ] })
                ] })
              ] }) }, post.id);
            })
          ] })
        ] }),
        activeTab === "job" && /* @__PURE__ */ jsxs("div", { children: [
          job && jobCompany && jobPosition && /* @__PURE__ */ jsxs("div", { style: { background: C.surface, border: `1px solid ${C.gold}55`, borderRadius: 14, padding: 16, marginBottom: 16 }, children: [
            /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: C.gold, textTransform: "uppercase", letterSpacing: 1 }, children: "\u0422\u0435\u043A\u0443\u0449\u0435\u0435 \u043C\u0435\u0441\u0442\u043E \u0440\u0430\u0431\u043E\u0442\u044B" }),
            /* @__PURE__ */ jsx("div", { style: { fontSize: 16, fontWeight: 700, marginTop: 4 }, children: jobCompany.name }),
            /* @__PURE__ */ jsxs("div", { style: { fontSize: 12, color: C.inkDim, marginBottom: 12 }, children: [
              jobPosition.name,
              " \xB7 \u043E\u043A\u043B\u0430\u0434 ",
              fmt(jobPosition.salary),
              "/\u0441\u043C\u0435\u043D\u0430 \xB7 \u041D\u0414\u0424\u041B 13% \u043D\u0430\u0447\u0438\u0441\u043B\u0438\u0442\u0441\u044F \u0432 \u043D\u0430\u043B\u043E\u0433\u0438"
            ] }),
            jobCooldown > 0 ? /* @__PURE__ */ jsxs("div", { style: { textAlign: "center", padding: "12px 0", color: C.inkFaint, fontSize: 14, fontWeight: 600, marginBottom: 8 }, children: [
              "\u041E\u0442\u0434\u044B\u0445\u2026 ",
              jobCooldown,
              "\u0441"
            ] }) : /* @__PURE__ */ jsx("div", { style: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 8 }, children: TASK_OPTIONS.map((t) => /* @__PURE__ */ jsxs("button", { onClick: () => workShift(t.id), style: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface2, color: C.ink, textAlign: "left" }, children: [
              /* @__PURE__ */ jsx("div", { style: { fontSize: 20 }, children: t.icon }),
              /* @__PURE__ */ jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [
                /* @__PURE__ */ jsxs("div", { style: { fontWeight: 700, fontSize: 13 }, children: [
                  t.name,
                  t.risky ? "" : t.payMult !== 1 ? ` \xB7 \xD7${t.payMult}` : ""
                ] }),
                /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: C.inkDim }, children: t.desc })
              ] }),
              /* @__PURE__ */ jsxs("div", { style: { fontSize: 11, color: C.inkFaint, textAlign: "right", flexShrink: 0 }, children: [
                Math.round(jobPosition.cooldown * t.cooldownMult),
                "\u0441"
              ] })
            ] }, t.id)) }),
            /* @__PURE__ */ jsx("button", { onClick: quitJob, style: { width: "100%", padding: 10, borderRadius: 10, border: `1px solid ${C.border}`, background: "transparent", color: C.inkDim, fontSize: 13 }, children: "\u0423\u0432\u043E\u043B\u0438\u0442\u044C\u0441\u044F" })
          ] }),
          /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: C.inkDim, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }, children: "\u0412\u0430\u043A\u0430\u043D\u0441\u0438\u0438" }),
          companies.filter((c) => !c.isPlayer && EMPLOYER_TICKERS.includes(c.ticker)).map((c) => {
            const shifts = jobHistory[c.id] || 0;
            return /* @__PURE__ */ jsxs("div", { style: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 14px", marginBottom: 8 }, children: [
              /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }, children: [
                /* @__PURE__ */ jsx("div", { style: { fontWeight: 600, fontSize: 14 }, children: c.name }),
                /* @__PURE__ */ jsxs("div", { style: { fontSize: 11, color: C.inkFaint }, children: [
                  "\u0441\u0442\u0430\u0436: ",
                  shifts,
                  " \u0441\u043C."
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" }, children: POSITIONS.map((p) => {
                const unlocked = shifts >= p.minShifts;
                const isCurrent = job && job.companyId === c.id && job.positionId === p.id;
                return /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: () => unlocked && takeJob(c.id, p.id),
                    disabled: !unlocked || isCurrent,
                    style: { flex: "1 1 auto", minWidth: 92, padding: "8px 10px", borderRadius: 9, fontSize: 11.5, textAlign: "center", border: `1px solid ${isCurrent ? C.gold : C.border}`, background: isCurrent ? `${C.gold}22` : unlocked ? C.surface2 : "transparent", color: unlocked ? isCurrent ? C.gold : C.ink : C.inkFaint },
                    children: [
                      p.name,
                      /* @__PURE__ */ jsx("br", {}),
                      /* @__PURE__ */ jsx("span", { style: { fontFamily: "'JetBrains Mono', monospace" }, children: fmt(p.salary) }),
                      !unlocked && /* @__PURE__ */ jsxs(Fragment, { children: [
                        /* @__PURE__ */ jsx("br", {}),
                        /* @__PURE__ */ jsxs("span", { style: { fontSize: 10 }, children: [
                          "\u043E\u0442 ",
                          p.minShifts,
                          " \u0441\u043C\u0435\u043D"
                        ] })
                      ] })
                    ]
                  },
                  p.id
                );
              }) })
            ] }, c.id);
          })
        ] }),
        activeTab === "inspection" && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }, children: [
            /* @__PURE__ */ jsx("button", { onClick: () => setIpTab("account"), style: segStyle(ipTab === "account"), children: "\u0421\u0447\u0451\u0442" }),
            /* @__PURE__ */ jsx("button", { onClick: () => setIpTab("taxes"), style: segStyle(ipTab === "taxes"), children: "\u041D\u0430\u043B\u043E\u0433\u0438" }),
            /* @__PURE__ */ jsx("button", { onClick: () => setIpTab("loans"), style: segStyle(ipTab === "loans"), children: "\u041A\u0440\u0435\u0434\u0438\u0442\u044B" }),
            /* @__PURE__ */ jsxs("button", { onClick: () => setIpTab("fines"), style: segStyle(ipTab === "fines"), children: [
              "\u0428\u0442\u0440\u0430\u0444\u044B",
              fines.length > 0 ? ` (${fines.length})` : ""
            ] })
          ] }),
          ipTab === "account" && /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { style: { background: "linear-gradient(135deg, #1A2029, #0B0E14)", border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, marginBottom: 16 }, children: [
              /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: C.inkDim, letterSpacing: 1.5, textTransform: "uppercase" }, children: "\u0421\u0447\u0451\u0442 \u0418\u041F" }),
              /* @__PURE__ */ jsx("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 26, fontWeight: 700, marginTop: 6 }, children: fmt(ipCash) }),
              /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: C.inkFaint, marginTop: 4 }, children: "\u041E\u0442\u0434\u0435\u043B\u044C\u043D\u043E \u043E\u0442 \u043B\u0438\u0447\u043D\u043E\u0433\u043E \u0441\u0447\u0451\u0442\u0430 \xB7 \u0437\u0430\u043A\u0443\u043F\u043A\u0438 \u0438 \u0432\u044B\u0440\u0443\u0447\u043A\u0430 \u043C\u0430\u0433\u0430\u0437\u0438\u043D\u043E\u0432 \u0438\u0434\u0443\u0442 \u043E\u0442\u0441\u044E\u0434\u0430" })
            ] }),
            /* @__PURE__ */ jsxs("div", { style: { background: C.surface, border: `1px solid ${ipTurnoverUsed > IP_TURNOVER_CAP ? C.red + "55" : C.border}`, borderRadius: 14, padding: 16, marginBottom: 14 }, children: [
              /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 11, color: C.inkDim, marginBottom: 6 }, children: [
                /* @__PURE__ */ jsx("span", { children: "\u041E\u0431\u043E\u0440\u043E\u0442 \u043A\u0432\u0430\u0440\u0442\u0430\u043B\u0430" }),
                /* @__PURE__ */ jsxs("span", { children: [
                  fmt(ipTurnoverUsed),
                  " / ",
                  fmt(IP_TURNOVER_CAP)
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { style: { height: 5, borderRadius: 3, background: C.surface2, overflow: "hidden" }, children: /* @__PURE__ */ jsx("div", { style: { height: "100%", width: `${Math.min(100, ipTurnoverUsed / IP_TURNOVER_CAP * 100)}%`, background: ipTurnoverUsed > IP_TURNOVER_CAP ? C.red : C.gold } }) }),
              /* @__PURE__ */ jsx("div", { style: { fontSize: 10.5, color: C.inkFaint, marginTop: 6 }, children: ipTurnoverUsed > IP_TURNOVER_CAP ? `\u041F\u0440\u0435\u0432\u044B\u0448\u0435\u043D\u0438\u0435 \u2014 \u043D\u0430 \u0432\u044B\u0440\u0443\u0447\u043A\u0443 \u0441\u0432\u0435\u0440\u0445 $100k \u043D\u0430\u0447\u0438\u0441\u043B\u044F\u0435\u0442\u0441\u044F \u0435\u0449\u0451 ${Math.round(IP_WEALTH_TAX_RATE * 100)}% \u043D\u0430\u043B\u043E\u0433\u0430 \u043D\u0430 \u0431\u043E\u0433\u0430\u0442\u0441\u0442\u0432\u043E.` : `\u0421\u0432\u044B\u0448\u0435 $100k \u0437\u0430 \u043A\u0432\u0430\u0440\u0442\u0430\u043B \u2014 \u0434\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u043D\u0430\u043B\u043E\u0433 \u043D\u0430 \u0431\u043E\u0433\u0430\u0442\u0441\u0442\u0432\u043E ${Math.round(IP_WEALTH_TAX_RATE * 100)}% \u0441\u0432\u0435\u0440\u0445 \u043E\u0431\u044B\u0447\u043D\u044B\u0445.` })
            ] }),
            /* @__PURE__ */ jsxs("div", { style: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 14 }, children: [
              /* @__PURE__ */ jsx("div", { style: { fontSize: 13, fontWeight: 700, marginBottom: 10 }, children: "\u041F\u0435\u0440\u0435\u0432\u043E\u0434 \u043C\u0435\u0436\u0434\u0443 \u0441\u0447\u0435\u0442\u0430\u043C\u0438" }),
              /* @__PURE__ */ jsx("input", { value: ipTransferInput, onChange: (e) => setIpTransferInput(e.target.value.replace(/[^0-9]/g, "")), placeholder: "\u0421\u0443\u043C\u043C\u0430", inputMode: "numeric", style: { ...inputStyle, marginBottom: 8 } }),
              /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8 }, children: [
                /* @__PURE__ */ jsx("button", { onClick: () => depositToIp(ipTransferInput), disabled: !ipTransferInput || Number(ipTransferInput) > cash, style: { flex: 1, padding: 10, borderRadius: 10, border: "none", fontWeight: 700, fontSize: 12.5, background: C.surface2, color: C.ink }, children: "\u041F\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u044C \u0441\u043E \u0441\u0432\u043E\u0435\u0433\u043E \u0441\u0447\u0451\u0442\u0430" }),
                /* @__PURE__ */ jsx("button", { onClick: () => transferToPersonal(ipTransferInput), disabled: !ipTransferInput || Number(ipTransferInput) > ipCash, style: { flex: 1, padding: 10, borderRadius: 10, border: "none", fontWeight: 700, fontSize: 12.5, background: C.gold, color: "#161207" }, children: "\u0412\u044B\u0432\u0435\u0441\u0442\u0438 \u0441\u0435\u0431\u0435 (\u22122%)" })
              ] }),
              /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: C.inkFaint, marginTop: 8 }, children: "\u041F\u043E\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u0435 \u0431\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u043E. \u0412\u044B\u0432\u043E\u0434 \u043F\u0440\u0438\u0431\u044B\u043B\u0438 \u0441\u0435\u0431\u0435 \u2014 \u043A\u043E\u043C\u0438\u0441\u0441\u0438\u044F 2%." })
            ] }),
            Object.keys(ipHoldings).length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: C.inkDim, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }, children: "\u041A\u0440\u0438\u043F\u0442\u043E-\u0430\u043A\u0442\u0438\u0432\u044B \u0418\u041F" }),
              Object.entries(ipHoldings).map(([cid, h]) => {
                const c = companies.find((x) => x.id === cid);
                if (!c) return null;
                const value = c.price * h.qty;
                const pnl = (c.price - h.avgCost) * h.qty;
                const pnlPct = h.avgCost > 0 ? (c.price - h.avgCost) / h.avgCost * 100 : 0;
                return /* @__PURE__ */ jsxs("button", { onClick: () => {
                  setSelectedId(cid);
                  setTradeSide("sell");
                  setTradeQty(1);
                  setTradeLeverage(1);
                  setTradeAccount("ip");
                  setTradeQtyMode("qty");
                  setTradeAmountInput("");
                }, style: { width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 14px", marginBottom: 8, textAlign: "left" }, children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("div", { style: { fontWeight: 600, fontSize: 14 }, children: c.ticker }),
                    /* @__PURE__ */ jsxs("div", { style: { fontSize: 11, color: C.inkDim }, children: [
                      h.qty.toLocaleString(),
                      " \u0448\u0442 \xB7 \u0441\u0440. ",
                      fmt(h.avgCost)
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { style: { textAlign: "right" }, children: [
                    /* @__PURE__ */ jsx("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }, children: fmt(value) }),
                    /* @__PURE__ */ jsxs("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: pnl >= 0 ? C.green : C.red }, children: [
                      pnl >= 0 ? "+" : "",
                      fmt(pnl),
                      " (",
                      pnlPct >= 0 ? "+" : "",
                      pnlPct.toFixed(1),
                      "%)"
                    ] })
                  ] })
                ] }, cid);
              })
            ] })
          ] }),
          ipTab === "taxes" && /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { style: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 14 }, children: [
              /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: C.inkDim, textTransform: "uppercase", letterSpacing: 1 }, children: "\u0422\u0435\u043A\u0443\u0449\u0438\u0439 \u043A\u0432\u0430\u0440\u0442\u0430\u043B" }),
              /* @__PURE__ */ jsx("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 700, margin: "4px 0" }, children: fmt(quarterRevenue) }),
              /* @__PURE__ */ jsxs("div", { style: { fontSize: 11.5, color: C.inkDim }, children: [
                "\u0432\u044B\u0440\u0443\u0447\u043A\u0430 \u0441 \u043D\u0430\u0447\u0430\u043B\u0430 \u043A\u0432\u0430\u0440\u0442\u0430\u043B\u0430 \xB7 \u0434\u0435\u043A\u043B\u0430\u0440\u0430\u0446\u0438\u044F \u0447\u0435\u0440\u0435\u0437 ",
                Math.max(0, Math.floor((quarterEndsAt - Date.now()) / 6e4)),
                " \u043C\u0438\u043D"
              ] }),
              /* @__PURE__ */ jsxs("div", { style: { fontSize: 11, color: C.inkFaint, marginTop: 6 }, children: [
                "\u0421\u0442\u0430\u0432\u043A\u0430 \u0423\u0421\u041D \xAB\u0434\u043E\u0445\u043E\u0434\u044B\xBB \u2014 ",
                Math.round(IP_TAX_RATE * 100),
                "% \u043E\u0442 \u0432\u044B\u0440\u0443\u0447\u043A\u0438 \u043A\u0432\u0430\u0440\u0442\u0430\u043B\u0430"
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: C.inkDim, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }, children: "\u0414\u0435\u043A\u043B\u0430\u0440\u0430\u0446\u0438\u0438" }),
            declarations.length === 0 && /* @__PURE__ */ jsx("div", { style: { color: C.inkFaint, fontSize: 13, padding: "16px 0", textAlign: "center" }, children: "\u041F\u043E\u043A\u0430 \u0434\u0435\u043A\u043B\u0430\u0440\u0430\u0446\u0438\u0439 \u043D\u0435 \u0431\u044B\u043B\u043E" }),
            declarations.map((d) => /* @__PURE__ */ jsxs("div", { style: { background: C.surface, border: `1px solid ${!d.paid ? C.red + "55" : C.border}`, borderRadius: 14, padding: 16, marginBottom: 12 }, children: [
              /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 12.5, color: C.inkDim, marginBottom: 6 }, children: [
                /* @__PURE__ */ jsx("span", { children: "\u0412\u044B\u0440\u0443\u0447\u043A\u0430 \u0437\u0430 \u043A\u0432\u0430\u0440\u0442\u0430\u043B" }),
                /* @__PURE__ */ jsx("span", { style: { color: C.ink, fontFamily: "'JetBrains Mono', monospace" }, children: fmt(d.revenue) })
              ] }),
              /* @__PURE__ */ jsx("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 700, color: d.paid ? C.ink : C.red, marginBottom: 8 }, children: fmt(d.tax) }),
              d.penalized && !d.paid && /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: C.red, marginBottom: 8 }, children: "\u041F\u0440\u043E\u0441\u0440\u043E\u0447\u0435\u043D\u043E \u2014 \u043D\u0430\u0447\u0438\u0441\u043B\u0435\u043D \u0448\u0442\u0440\u0430\u0444 30%" }),
              d.paid ? /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: C.green, fontWeight: 600 }, children: "\u041E\u043F\u043B\u0430\u0447\u0435\u043D\u043E" }) : /* @__PURE__ */ jsx("button", { onClick: () => payDeclaration(d.id), disabled: ipCash < d.tax, style: { width: "100%", padding: 10, borderRadius: 10, border: "none", fontWeight: 700, fontSize: 12.5, background: ipCash >= d.tax ? C.gold : C.surface2, color: ipCash >= d.tax ? "#161207" : C.inkFaint }, children: ipCash >= d.tax ? "\u041F\u043E\u0434\u0430\u0442\u044C \u0438 \u043E\u043F\u043B\u0430\u0442\u0438\u0442\u044C \u0441\u043E \u0441\u0447\u0451\u0442\u0430 \u0418\u041F" : `\u041D\u0435 \u0445\u0432\u0430\u0442\u0430\u0435\u0442 ${fmt(d.tax - ipCash)}` })
            ] }, d.id))
          ] }),
          ipTab === "loans" && /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { style: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12, marginBottom: 12, fontSize: 11.5, color: C.inkDim, lineHeight: 1.6 }, children: "\u041A\u0440\u0435\u0434\u0438\u0442 \u043F\u043E\u0434 \u0437\u0430\u043B\u043E\u0433 \u0442\u043E\u0432\u0430\u0440\u0430 \u043D\u0430 \u0441\u043A\u043B\u0430\u0434\u0435. \u0415\u0441\u043B\u0438 \u0434\u043E\u043B\u0433 \u0432\u044B\u0440\u0430\u0441\u0442\u0435\u0442 \u0434\u043E 150% \u2014 \u0430\u043A\u0442\u0438\u0432\u044B \u043F\u043E\u0434 \u0430\u0440\u0435\u0441\u0442\u043E\u043C (\u043D\u0435\u043B\u044C\u0437\u044F \u0432\u044B\u0441\u0442\u0430\u0432\u043B\u044F\u0442\u044C \u043D\u0430 \u043F\u0440\u043E\u0434\u0430\u0436\u0443), \u0434\u043E 170% \u2014 \u0431\u0430\u043D\u043A \u0437\u0430\u0431\u0435\u0440\u0451\u0442 \u0442\u043E\u0432\u0430\u0440 \u0432 \u0441\u0447\u0451\u0442 \u0434\u043E\u043B\u0433\u0430. \u041B\u0438\u0447\u043D\u044B\u0439 \u0441\u0447\u0451\u0442 \u0438 \u0430\u043A\u0442\u0438\u0432\u044B \u0444\u0438\u0437\u043B\u0438\u0446\u0430 \u044D\u0442\u043E \u043D\u0435 \u0437\u0430\u0442\u0440\u0430\u0433\u0438\u0432\u0430\u0435\u0442." }),
            ipLoans.map((l) => {
              const ratio = l.balance / l.principal;
              return /* @__PURE__ */ jsxs("div", { style: { background: C.surface, border: `1px solid ${C.red}55`, borderRadius: 14, padding: 16, marginBottom: 12 }, children: [
                /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: C.red, textTransform: "uppercase", letterSpacing: 1 }, children: IP_BANK.name }),
                /* @__PURE__ */ jsx("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 700, margin: "4px 0" }, children: fmt(l.balance) }),
                /* @__PURE__ */ jsxs("div", { style: { fontSize: 11.5, color: C.inkDim, marginBottom: 10 }, children: [
                  "\u041C\u0438\u043D. \u043F\u043B\u0430\u0442\u0451\u0436 ",
                  fmt(l.minPayment),
                  " \xB7 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u0447\u0435\u0440\u0435\u0437 ",
                  l.dueIn,
                  "\u0441",
                  l.paidThisCycle ? /* @__PURE__ */ jsx("span", { style: { color: C.green }, children: " \xB7 \u043E\u043F\u043B\u0430\u0447\u0435\u043D\u043E" }) : null
                ] }),
                l.frozen && /* @__PURE__ */ jsxs("div", { style: { fontSize: 11.5, color: C.red, marginBottom: 10, fontWeight: 600 }, children: [
                  "\u26A0 \u0414\u043E\u043B\u0433 ",
                  Math.round(ratio * 100),
                  "% \u2014 \u0442\u043E\u0432\u0430\u0440 \u043F\u043E\u0434 \u0430\u0440\u0435\u0441\u0442\u043E\u043C",
                  ratio >= 1.6 ? ", \u0441\u043A\u043E\u0440\u043E \u0437\u0430\u0431\u0435\u0440\u0443\u0442 \u0432 \u0441\u0447\u0451\u0442 \u0434\u043E\u043B\u0433\u0430" : ""
                ] }),
                /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8 }, children: [
                  /* @__PURE__ */ jsx("button", { onClick: () => repayIpLoan(l.id, l.minPayment), disabled: ipCash < l.minPayment, style: { flex: 1, padding: 9, borderRadius: 9, border: "none", background: C.surface2, color: C.ink, fontWeight: 600, fontSize: 12 }, children: "\u041C\u0438\u043D. \u043F\u043B\u0430\u0442\u0451\u0436" }),
                  /* @__PURE__ */ jsx("button", { onClick: () => repayIpLoan(l.id, l.balance), disabled: ipCash < l.balance, style: { flex: 1, padding: 9, borderRadius: 9, border: "none", background: C.green, color: "#06210f", fontWeight: 700, fontSize: 12 }, children: "\u041F\u043E\u0433\u0430\u0441\u0438\u0442\u044C \u0432\u0441\u0451" })
                ] })
              ] }, l.id);
            }),
            ipLoans.length === 0 && /* @__PURE__ */ jsxs("div", { style: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 12 }, children: [
              /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between" }, children: [
                /* @__PURE__ */ jsx("div", { style: { fontWeight: 700, fontSize: 15 }, children: IP_BANK.name }),
                /* @__PURE__ */ jsxs("div", { style: { fontSize: 11, color: C.inkDim }, children: [
                  "\u0437\u0430\u043B\u043E\u0433: ",
                  fmt(stockCollateralValue)
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { style: { fontSize: 11, color: bzkrHealth >= 0 ? C.green : C.red, marginBottom: 4 }, children: [
                IP_BANK.ticker,
                " \u043D\u0430 \u0431\u0438\u0440\u0436\u0435 ",
                bzkrHealth >= 0 ? "+" : "",
                bzkrHealth.toFixed(1),
                "%"
              ] }),
              /* @__PURE__ */ jsxs("div", { style: { fontSize: 12, color: C.inkDim, margin: "8px 0" }, children: [
                "\u041B\u0438\u043C\u0438\u0442 \u2248 ",
                fmt(ipLoanLimit),
                ". \u0420\u0430\u0441\u0442\u0451\u0442 \u0432\u043C\u0435\u0441\u0442\u0435 \u0441 \u043E\u0431\u043E\u0440\u043E\u0442\u043E\u043C \u0418\u041F \u0438 \u0435\u0433\u043E \u043F\u043E\u043B\u043E\u0436\u0435\u043D\u0438\u0435\u043C \u043D\u0430 \u0431\u0438\u0440\u0436\u0435."
              ] }),
              /* @__PURE__ */ jsxs("div", { style: { fontSize: 11, color: ipBankRating >= 65 ? C.green : ipBankRating >= 35 ? C.gold : C.red, marginBottom: 8 }, children: [
                "\u041A\u0440\u0435\u0434\u0438\u0442\u043D\u0430\u044F \u0438\u0441\u0442\u043E\u0440\u0438\u044F \u0432 \u0431\u0430\u043D\u043A\u0435: ",
                Math.round(ipBankRating),
                "/100"
              ] }),
              /* @__PURE__ */ jsx("input", { value: ipLoanInput, onChange: (e) => setIpLoanInput(e.target.value.replace(/[^0-9]/g, "")), placeholder: "\u0421\u0443\u043C\u043C\u0430 \u043A\u0440\u0435\u0434\u0438\u0442\u0430", inputMode: "numeric", style: { ...inputStyle, marginBottom: 8 } }),
              /* @__PURE__ */ jsx("button", { onClick: applyForIpLoan, style: { width: "100%", padding: 11, borderRadius: 10, border: "none", fontWeight: 700, background: C.gold, color: "#161207" }, children: "\u041F\u043E\u0434\u0430\u0442\u044C \u0437\u0430\u044F\u0432\u043A\u0443" }),
              ipLoanFeedback && /* @__PURE__ */ jsx("div", { style: { fontSize: 11.5, color: ipLoanFeedback.ok ? C.green : C.red, marginTop: 8 }, children: ipLoanFeedback.msg })
            ] })
          ] }),
          ipTab === "fines" && /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { style: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 14, fontSize: 12, color: C.inkDim, lineHeight: 1.6 }, children: "\u0424\u0438\u043D\u0430\u043D\u0441\u043E\u0432\u0430\u044F \u0438\u043D\u0441\u043F\u0435\u043A\u0446\u0438\u044F \u0441\u043B\u0435\u0434\u0438\u0442 \u0437\u0430 \u043F\u043E\u0434\u043E\u0437\u0440\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u043C\u0438 \u043E\u043F\u0435\u0440\u0430\u0446\u0438\u044F\u043C\u0438 \u0438 \u043F\u0440\u043E\u0441\u0440\u043E\u0447\u043A\u0430\u043C\u0438 \u0434\u0435\u043A\u043B\u0430\u0440\u0430\u0446\u0438\u0439. \u041F\u043E\u0439\u043C\u0430\u043D\u043D\u044B\u043C \u2014 \u0448\u0442\u0440\u0430\u0444, \u043E\u043F\u043B\u0430\u0442\u0430 \u043D\u0438\u0436\u0435 \u043F\u043E \u043A\u0430\u0436\u0434\u043E\u043C\u0443 \u043E\u0442\u0434\u0435\u043B\u044C\u043D\u043E." }),
            fines.length === 0 && /* @__PURE__ */ jsx("div", { style: { color: C.inkFaint, fontSize: 13, padding: "30px 0", textAlign: "center" }, children: "\u0428\u0442\u0440\u0430\u0444\u043E\u0432 \u043D\u0435\u0442 \u2014 \u0438\u043D\u0441\u043F\u0435\u043A\u0446\u0438\u044F \u0434\u043E\u0432\u043E\u043B\u044C\u043D\u0430" }),
            fines.map((f) => /* @__PURE__ */ jsxs("div", { style: { background: C.surface, border: `1px solid ${C.red}55`, borderRadius: 14, padding: 16, marginBottom: 12 }, children: [
              /* @__PURE__ */ jsx("div", { style: { fontSize: 13, fontWeight: 600, marginBottom: 6 }, children: f.label }),
              /* @__PURE__ */ jsx("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 700, color: C.red, marginBottom: 10 }, children: fmt(f.amount) }),
              /* @__PURE__ */ jsx("button", { onClick: () => payFine(f.id), disabled: (resolvedPayFrom === "personal" ? cash : resolvedPayFrom === "grey" ? greyAccount?.balance || 0 : bankAccounts[resolvedPayFrom]?.balance || 0) < f.amount, style: { width: "100%", padding: 10, borderRadius: 10, border: "none", fontWeight: 700, background: (resolvedPayFrom === "personal" ? cash : resolvedPayFrom === "grey" ? greyAccount?.balance || 0 : bankAccounts[resolvedPayFrom]?.balance || 0) >= f.amount ? C.gold : C.surface2, color: (resolvedPayFrom === "personal" ? cash : resolvedPayFrom === "grey" ? greyAccount?.balance || 0 : bankAccounts[resolvedPayFrom]?.balance || 0) >= f.amount ? "#161207" : C.inkFaint }, children: (resolvedPayFrom === "personal" ? cash : resolvedPayFrom === "grey" ? greyAccount?.balance || 0 : bankAccounts[resolvedPayFrom]?.balance || 0) >= f.amount ? "\u041E\u043F\u043B\u0430\u0442\u0438\u0442\u044C" : `\u041D\u0435 \u0445\u0432\u0430\u0442\u0430\u0435\u0442 ${fmt(f.amount - (resolvedPayFrom === "personal" ? cash : resolvedPayFrom === "grey" ? greyAccount?.balance || 0 : bankAccounts[resolvedPayFrom]?.balance || 0))}` })
            ] }, f.id))
          ] })
        ] }),
        activeTab === "company" && /* @__PURE__ */ jsxs("div", { children: [
          playerVenture && selectedBizId === "venture" && /* @__PURE__ */ jsxs("div", { style: { marginBottom: 22 }, children: [
            /* @__PURE__ */ jsxs("div", { style: { background: C.surface, border: `1px solid ${playerVenture.rugged ? C.red + "55" : C.gold + "55"}`, borderRadius: 14, padding: 16, marginBottom: 14 }, children: [
              /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" }, children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: C.gold, letterSpacing: 1, textTransform: "uppercase" }, children: playerVenture.kind === "crypto" ? playerVenture.strategy === "scam" ? "\u041A\u0440\u0438\u043F\u0442\u043E \xB7 \u0441\u0445\u0435\u043C\u0430 \u043D\u0430 \u0445\u0430\u0439\u043F\u0435" : "\u041A\u0440\u0438\u043F\u0442\u043E \xB7 \u0442\u0435\u0445\u043D\u043E\u043B\u043E\u0433\u0438\u0447\u043D\u044B\u0439 \u043F\u0443\u0442\u044C" : playerVenture.sector }),
                  /* @__PURE__ */ jsx("div", { style: { fontSize: 18, fontWeight: 700 }, children: playerVenture.name }),
                  /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: C.inkDim, fontFamily: "'JetBrains Mono', monospace" }, children: playerVenture.ticker })
                ] }),
                /* @__PURE__ */ jsxs("div", { style: { textAlign: "right" }, children: [
                  /* @__PURE__ */ jsx("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 700 }, children: fmt(playerVenture.price) }),
                  /* @__PURE__ */ jsxs("div", { style: { fontSize: 11, color: C.inkDim }, children: [
                    "\u043A\u0430\u043F\u0438\u0442\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u044F ",
                    fmt(playerVenture.price * playerVenture.supply)
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { style: { marginTop: 12 }, children: /* @__PURE__ */ jsx(CandleChart, { companyId: playerVenture.id, engineRef, candles: playerVenture.candles, height: 190 }) }),
              founderHolding && /* @__PURE__ */ jsxs("div", { style: { fontSize: 11, color: C.inkDim, marginTop: 10 }, children: [
                "\u0422\u0435\u0431\u0435 \u043F\u0440\u0438\u043D\u0430\u0434\u043B\u0435\u0436\u0438\u0442 ",
                founderHolding.qty.toLocaleString(),
                " \u0438\u0437 ",
                playerVenture.supply.toLocaleString(),
                " (",
                (founderHolding.qty / playerVenture.supply * 100).toFixed(1),
                "%) \u2014 \u044D\u0442\u0438 \u0442\u043E\u043A\u0435\u043D\u044B \u0432 \xAB\u041A\u0430\u0431\u0438\u043D\u0435\u0442\u0435\xBB"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { style: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 14 }, children: [
              /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }, children: [
                /* @__PURE__ */ jsx("div", { style: { fontSize: 13, fontWeight: 700 }, children: "\u0418\u043D\u0432\u0435\u0441\u0442\u0438\u0446\u0438\u043E\u043D\u043D\u044B\u0435 \u0440\u0430\u0443\u043D\u0434\u044B" }),
                /* @__PURE__ */ jsxs("div", { style: { fontSize: 11, color: C.inkDim }, children: [
                  "\u0437\u0430\u043A\u0440\u044B\u0442\u043E: ",
                  playerVenture.investorRounds || 0
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: C.inkFaint, lineHeight: 1.5, marginBottom: 10 }, children: "\u041A\u0430\u043F\u0438\u0442\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u044F \u0440\u0430\u0441\u0442\u0451\u0442 \u0432 \u043E\u0441\u043D\u043E\u0432\u043D\u043E\u043C \u0437\u0430 \u0441\u0447\u0451\u0442 \u0438\u043D\u0432\u0435\u0441\u0442\u043E\u0440\u043E\u0432. \u0423 \u043A\u0430\u0436\u0434\u043E\u0433\u043E \u2014 \u0441\u0432\u043E\u0438 \u0438\u043D\u0442\u0435\u0440\u0435\u0441\u044B: \u0443\u0433\u0430\u0434\u0430\u0439, \u0447\u0442\u043E \u0432\u0430\u0436\u043D\u043E \u0438\u043C\u0435\u043D\u043D\u043E \u044D\u0442\u043E\u043C\u0443, \u0438 \u0448\u0430\u043D\u0441 \u043D\u0430 \u0441\u043E\u0433\u043B\u0430\u0441\u0438\u0435 \u0432\u0437\u043B\u0435\u0442\u0438\u0442." }),
              (playerVenture.investorCooldown || 0) > 0 ? /* @__PURE__ */ jsxs("div", { style: { textAlign: "center", padding: "10px 0", color: C.inkFaint, fontSize: 13, fontWeight: 600 }, children: [
                "\u0418\u043D\u0432\u0435\u0441\u0442\u043E\u0440\u044B \u0434\u0443\u043C\u0430\u044E\u0442\u2026 ",
                playerVenture.investorCooldown,
                "\u0441"
              ] }) : investorPersona ? /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10, background: C.surface2, borderRadius: 12, padding: 12, marginBottom: 10 }, children: [
                  /* @__PURE__ */ jsx("div", { style: { fontSize: 24 }, children: investorPersona.icon }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("div", { style: { fontWeight: 700, fontSize: 13.5 }, children: investorPersona.name }),
                    /* @__PURE__ */ jsxs("div", { style: { fontSize: 11.5, color: C.inkDim }, children: [
                      "\u0421\u043C\u043E\u0442\u0440\u0438\u0442 \u043D\u0430: ",
                      investorPersona.wants
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsx("div", { style: { fontSize: 11.5, color: C.inkFaint, marginBottom: 8 }, children: "\u0421 \u0447\u0435\u043C \u0438\u0434\u0442\u0438 \u043D\u0430 \u0432\u0441\u0442\u0440\u0435\u0447\u0443?" }),
                /* @__PURE__ */ jsx("div", { style: { display: "flex", gap: 6 }, children: PITCH_ANGLES.map((a) => /* @__PURE__ */ jsxs("button", { onClick: () => pitchInvestorsWithAngle(a.id), style: { flex: 1, padding: "10px 4px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface2, color: C.ink, fontSize: 11.5, fontWeight: 600 }, children: [
                  /* @__PURE__ */ jsx("div", { style: { fontSize: 16, marginBottom: 2 }, children: a.icon }),
                  a.label
                ] }, a.id)) })
              ] }) : /* @__PURE__ */ jsx("div", { style: { textAlign: "center", padding: "10px 0", color: C.inkFaint, fontSize: 12.5 }, children: "\u0418\u0449\u0435\u043C \u0438\u043D\u0432\u0435\u0441\u0442\u043E\u0440\u0430 \u0434\u043B\u044F \u0432\u0441\u0442\u0440\u0435\u0447\u0438\u2026" })
            ] }),
            playerVenture.rugged && /* @__PURE__ */ jsx("div", { style: { background: `${C.red}18`, border: `1px solid ${C.red}55`, borderRadius: 12, padding: 14, marginBottom: 12, fontSize: 13, color: C.red, textAlign: "center", fontWeight: 600 }, children: "\u041F\u0440\u043E\u0435\u043A\u0442 \u0440\u0430\u0437\u043E\u0431\u043B\u0430\u0447\u0451\u043D \u043A\u0430\u043A \u0441\u043A\u0430\u043C. \u0426\u0435\u043D\u0430 \u0440\u0443\u0445\u043D\u0443\u043B\u0430 \u2014 \u044D\u0442\u043E\u0442 \u0442\u043E\u043A\u0435\u043D \u0431\u043E\u043B\u044C\u0448\u0435 \u043D\u0435 \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C." }),
            playerVenture.kind !== "crypto" || playerVenture.strategy === "tech" ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsxs("button", { onClick: () => investInVenture("marketing"), disabled: resolvedBal < marketingCost, style: actionBtnStyle(resolvedBal >= marketingCost), children: [
                /* @__PURE__ */ jsx(Sparkles, { size: 16 }),
                " \u041C\u0430\u0440\u043A\u0435\u0442\u0438\u043D\u0433 \u2014 ",
                fmt(marketingCost)
              ] }),
              /* @__PURE__ */ jsxs("button", { onClick: () => investInVenture("rd"), disabled: resolvedBal < rdCost, style: actionBtnStyle(resolvedBal >= rdCost), children: [
                /* @__PURE__ */ jsx(FlaskConical, { size: 16 }),
                " \u0420\u0430\u0437\u0440\u0430\u0431\u043E\u0442\u043A\u0430 \u2014 ",
                fmt(rdCost)
              ] }),
              /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: C.inkFaint, lineHeight: 1.5, textAlign: "center", padding: "4px 8px" }, children: "\u041C\u0430\u0440\u043A\u0435\u0442\u0438\u043D\u0433 \u0440\u0430\u0437\u0433\u043E\u043D\u044F\u0435\u0442 \u0441\u043F\u0440\u043E\u0441 \u0438 \u0446\u0435\u043D\u0443. \u0420\u0430\u0437\u0440\u0430\u0431\u043E\u0442\u043A\u0430 \u0441\u043D\u0438\u0436\u0430\u0435\u0442 \u0432\u043E\u043B\u0430\u0442\u0438\u043B\u044C\u043D\u043E\u0441\u0442\u044C \u0438 \u0443\u043A\u0440\u0435\u043F\u043B\u044F\u0435\u0442 \u0434\u043E\u0432\u0435\u0440\u0438\u0435 \u043A \u043F\u0440\u043E\u0435\u043A\u0442\u0443." })
            ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsxs("button", { onClick: () => investInVenture("hypeSocial"), disabled: resolvedBal < hypeSocialCost || playerVenture.rugged, style: actionBtnStyle(resolvedBal >= hypeSocialCost && !playerVenture.rugged, C.red), children: [
                /* @__PURE__ */ jsx(Flame, { size: 16 }),
                " \u041F\u043E\u0441\u0442 \u0432 \u0441\u043E\u0446\u0441\u0435\u0442\u044F\u0445 \u2014 ",
                fmt(hypeSocialCost),
                " \xB7 \u0448\u0430\u043D\u0441 70%"
              ] }),
              /* @__PURE__ */ jsxs("button", { onClick: () => investInVenture("hypeBlogger"), disabled: resolvedBal < hypeBloggerCost || playerVenture.rugged, style: actionBtnStyle(resolvedBal >= hypeBloggerCost && !playerVenture.rugged, C.red), children: [
                /* @__PURE__ */ jsx(Flame, { size: 16 }),
                " \u0420\u0435\u043A\u043B\u0430\u043C\u0430 \u0443 \u0431\u043B\u043E\u0433\u0435\u0440\u043E\u0432 \u2014 ",
                fmt(hypeBloggerCost),
                " \xB7 \u0448\u0430\u043D\u0441 55%"
              ] }),
              /* @__PURE__ */ jsxs("button", { onClick: () => investInVenture("hypePR"), disabled: resolvedBal < hypePRCost || playerVenture.rugged, style: actionBtnStyle(resolvedBal >= hypePRCost && !playerVenture.rugged, C.red), children: [
                /* @__PURE__ */ jsx(Flame, { size: 16 }),
                " PR \u0432 \u0421\u041C\u0418 \u2014 ",
                fmt(hypePRCost),
                " \xB7 \u0448\u0430\u043D\u0441 40%"
              ] }),
              /* @__PURE__ */ jsxs("div", { style: { marginTop: 10, marginBottom: 6 }, children: [
                /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 11, color: C.inkDim, marginBottom: 4 }, children: [
                  /* @__PURE__ */ jsx("span", { children: "\u0420\u0438\u0441\u043A \u0440\u0430\u0437\u043E\u0431\u043B\u0430\u0447\u0435\u043D\u0438\u044F" }),
                  /* @__PURE__ */ jsxs("span", { children: [
                    Math.min(100, Math.round(playerVenture.scamHeat || 0)),
                    "%"
                  ] })
                ] }),
                /* @__PURE__ */ jsx("div", { style: { height: 6, borderRadius: 4, background: C.surface2, overflow: "hidden" }, children: /* @__PURE__ */ jsx("div", { style: { height: "100%", width: `${Math.min(100, playerVenture.scamHeat || 0)}%`, background: C.red } }) })
              ] }),
              /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: C.inkFaint, lineHeight: 1.5, textAlign: "center", padding: "4px 8px" }, children: "\u0412\u0441\u0435 \u0442\u0440\u0438 \u0445\u043E\u0434\u0430 \u043D\u0435 \u0433\u0430\u0440\u0430\u043D\u0442\u0438\u0440\u0443\u044E\u0442 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442 \u2014 \u0438\u043D\u043E\u0433\u0434\u0430 \u0434\u0435\u043D\u044C\u0433\u0438 \u043F\u043E\u0442\u0440\u0430\u0447\u0435\u043D\u044B \u0432\u043F\u0443\u0441\u0442\u0443\u044E. \u0421 \u043A\u0430\u0436\u0434\u044B\u043C \u0440\u0430\u0437\u043E\u043C \u0440\u0430\u0441\u0442\u0451\u0442 \u0448\u0430\u043D\u0441, \u0447\u0442\u043E \u043F\u0440\u043E\u0435\u043A\u0442 \u0440\u0430\u0437\u043E\u0431\u043B\u0430\u0447\u0430\u0442 \u2014 \u0438 \u0446\u0435\u043D\u0430 \u0440\u0443\u0445\u043D\u0435\u0442 \u043D\u0430\u0432\u0441\u0435\u0433\u0434\u0430." }),
              hypePosts.length > 0 && /* @__PURE__ */ jsxs("div", { style: { marginTop: 14 }, children: [
                /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: C.inkDim, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }, children: "\u041B\u0435\u043D\u0442\u0430" }),
                hypePosts.map((p) => /* @__PURE__ */ jsxs("div", { style: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12, marginBottom: 8 }, children: [
                  /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }, children: [
                    /* @__PURE__ */ jsx("div", { style: { width: 26, height: 26, borderRadius: "50%", background: `${C.gold}22`, color: C.gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }, children: playerVenture.ticker.slice(0, 2) }),
                    /* @__PURE__ */ jsxs("div", { style: { fontSize: 12.5, fontWeight: 600 }, children: [
                      playerVenture.ticker,
                      " \xB7 ",
                      p.label
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: p.success ? C.green : C.inkFaint }, children: p.success ? "\u041F\u043E\u0441\u0442 \u0440\u0430\u0437\u043B\u0435\u0442\u0435\u043B\u0441\u044F \u043F\u043E \u043B\u0435\u043D\u0442\u0435" : "\u041F\u043E\u0447\u0442\u0438 \u043D\u0438\u043A\u0442\u043E \u043D\u0435 \u0437\u0430\u043C\u0435\u0442\u0438\u043B" }),
                  /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 14, marginTop: 8, fontSize: 11, color: C.inkDim }, children: [
                    /* @__PURE__ */ jsxs("span", { children: [
                      "\u2665 ",
                      p.likes
                    ] }),
                    /* @__PURE__ */ jsxs("span", { children: [
                      "\u{1F4AC} ",
                      p.comments
                    ] })
                  ] })
                ] }, p.id))
              ] })
            ] }),
            /* @__PURE__ */ jsx("button", { onClick: () => setConfirmCloseVenture(true), style: { width: "100%", padding: 12, borderRadius: 10, border: `1px solid ${C.red}55`, background: "transparent", color: C.red, fontSize: 13, fontWeight: 600, marginTop: 14 }, children: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u0431\u0438\u0437\u043D\u0435\u0441" })
          ] }),
          resellShops.length > 0 && (() => {
            const totalRevenue = resellShops.reduce((s, x) => s + x.totalRevenue, 0);
            const totalUnits = resellShops.reduce((s, x) => s + x.totalUnitsSold, 0);
            const totalStockValue = resellShops.reduce((s, x) => s + Object.values(x.categories || {}).reduce((cs, c) => cs + c.stock * c.avgCost, 0), 0);
            const allReviews = resellShops.flatMap((x) => x.reviews);
            const posReviews = allReviews.filter((r) => r.positive).length;
            const avgRating = resellShops.reduce((s, x) => s + x.rating, 0) / resellShops.length;
            const activeAdsCount = resellShops.reduce((s, x) => s + (x.ads || []).filter((a) => Date.now() < a.until).length, 0);
            const best = [...resellShops].sort((a, b) => b.totalRevenue - a.totalRevenue)[0];
            return /* @__PURE__ */ jsxs("div", { style: { background: C.surface, border: `1px solid ${C.gold}55`, borderRadius: 16, padding: 16, marginBottom: 22 }, children: [
              /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: C.gold, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }, children: "\u041A\u0430\u0431\u0438\u043D\u0435\u0442 \u043F\u0440\u043E\u0434\u0430\u0432\u0446\u0430 \xB7 \u043C\u0430\u0440\u043A\u0435\u0442\u043F\u043B\u0435\u0439\u0441" }),
              /* @__PURE__ */ jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }, children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("div", { style: { fontSize: 10.5, color: C.inkDim }, children: "\u041C\u0430\u0433\u0430\u0437\u0438\u043D\u043E\u0432" }),
                  /* @__PURE__ */ jsx("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700 }, children: resellShops.length })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("div", { style: { fontSize: 10.5, color: C.inkDim }, children: "\u0421\u0443\u043C\u043C\u0430\u0440\u043D\u0430\u044F \u0432\u044B\u0440\u0443\u0447\u043A\u0430" }),
                  /* @__PURE__ */ jsx("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700 }, children: fmt(totalRevenue) })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("div", { style: { fontSize: 10.5, color: C.inkDim }, children: "\u041F\u0440\u043E\u0434\u0430\u043D\u043E \u0448\u0442\u0443\u043A" }),
                  /* @__PURE__ */ jsx("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700 }, children: totalUnits.toLocaleString() })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("div", { style: { fontSize: 10.5, color: C.inkDim }, children: "\u0412 \u0442\u043E\u0432\u0430\u0440\u0435 \u043D\u0430 \u0441\u043A\u043B\u0430\u0434\u0430\u0445" }),
                  /* @__PURE__ */ jsx("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700 }, children: fmt(totalStockValue) })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("div", { style: { fontSize: 10.5, color: C.inkDim }, children: "\u0421\u0440\u0435\u0434\u043D\u0438\u0439 \u0440\u0435\u0439\u0442\u0438\u043D\u0433" }),
                  /* @__PURE__ */ jsxs("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700, color: avgRating >= 4 ? C.green : avgRating >= 2.5 ? C.gold : C.red }, children: [
                    "\u2605 ",
                    avgRating.toFixed(1)
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("div", { style: { fontSize: 10.5, color: C.inkDim }, children: "\u041E\u0442\u0437\u044B\u0432\u043E\u0432" }),
                  /* @__PURE__ */ jsxs("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700 }, children: [
                    allReviews.length,
                    " ",
                    /* @__PURE__ */ jsxs("span", { style: { fontSize: 11, color: C.inkDim, fontWeight: 400 }, children: [
                      "(",
                      allReviews.length ? Math.round(posReviews / allReviews.length * 100) : 0,
                      "% \u{1F44D})"
                    ] })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 11.5, color: C.inkDim, paddingTop: 10, borderTop: `1px solid ${C.border}` }, children: [
                /* @__PURE__ */ jsxs("span", { children: [
                  "\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0445 \u0440\u0435\u043A\u043B\u0430\u043C\u043D\u044B\u0445 \u043A\u0430\u043C\u043F\u0430\u043D\u0438\u0439: ",
                  /* @__PURE__ */ jsx("b", { style: { color: C.ink }, children: activeAdsCount })
                ] }),
                best && /* @__PURE__ */ jsxs("span", { children: [
                  "\u0422\u043E\u043F-\u043C\u0430\u0433\u0430\u0437\u0438\u043D: ",
                  /* @__PURE__ */ jsx("b", { style: { color: C.ink }, children: best.name })
                ] })
              ] })
            ] });
          })(),
          (playerVenture || resellShops.length > 0) && /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 18 }, children: [
            playerVenture && /* @__PURE__ */ jsxs("button", { onClick: () => setSelectedBizId("venture"), style: { flexShrink: 0, display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 20, border: `1px solid ${selectedBizId === "venture" ? C.gold : C.border}`, background: selectedBizId === "venture" ? `${C.gold}22` : C.surface, color: selectedBizId === "venture" ? C.gold : C.inkDim, fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap" }, children: [
              playerVenture.kind === "crypto" ? "\u{1FA99}" : "\u{1F3E2}",
              " ",
              playerVenture.ticker
            ] }),
            resellShops.map((s) => /* @__PURE__ */ jsxs("button", { onClick: () => setSelectedBizId(s.id), style: { flexShrink: 0, display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 20, border: `1px solid ${selectedBizId === s.id ? C.gold : C.border}`, background: selectedBizId === s.id ? `${C.gold}22` : C.surface, color: selectedBizId === s.id ? C.gold : C.inkDim, fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap" }, children: [
              "\u{1F6CD}\uFE0F ",
              s.name
            ] }, s.id)),
            /* @__PURE__ */ jsxs("button", { onClick: () => setSelectedBizId(null), style: { flexShrink: 0, display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 20, border: `1px dashed ${C.border}`, background: "none", color: C.inkFaint, fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap" }, children: [
              /* @__PURE__ */ jsx(Plus, { size: 13 }),
              " \u0415\u0449\u0451 \u0431\u0438\u0437\u043D\u0435\u0441"
            ] })
          ] }),
          resellShops.map((shop) => {
            if (shop.id !== selectedBizId) return null;
            return /* @__PURE__ */ jsxs("div", { style: { marginBottom: 22, paddingTop: 14, borderTop: `1px solid ${C.border}` }, children: [
              /* @__PURE__ */ jsxs("div", { style: { background: C.surface, border: `1px solid ${C.gold}55`, borderRadius: 14, padding: 16, marginBottom: 14 }, children: [
                /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" }, children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: C.gold, textTransform: "uppercase", letterSpacing: 1 }, children: "\u041F\u0435\u0440\u0435\u043F\u0440\u043E\u0434\u0430\u0436\u0430 \u0442\u0435\u0445\u043D\u0438\u043A\u0438 \u0438 \u043E\u0434\u0435\u0436\u0434\u044B" }),
                    /* @__PURE__ */ jsx("div", { style: { fontSize: 18, fontWeight: 700, marginTop: 4 }, children: shop.name })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { style: { fontSize: 14, fontWeight: 700, color: shop.rating >= 4 ? C.green : shop.rating >= 2.5 ? C.gold : C.red }, children: [
                    "\u2605 ",
                    shop.rating.toFixed(1)
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 12, marginTop: 10, fontSize: 12, color: C.inkDim, flexWrap: "wrap" }, children: [
                  PRODUCT_CATEGORIES.map((cat) => {
                    const c = shop.categories?.[cat.id];
                    if (!c || c.stock <= 0) return null;
                    return /* @__PURE__ */ jsxs("span", { children: [
                      cat.icon,
                      " ",
                      cat.name,
                      ": ",
                      /* @__PURE__ */ jsx("b", { style: { color: C.ink }, children: c.stock }),
                      " \u0448\u0442"
                    ] }, cat.id);
                  }),
                  !PRODUCT_CATEGORIES.some((cat) => (shop.categories?.[cat.id]?.stock || 0) > 0) && /* @__PURE__ */ jsx("span", { children: "\u0421\u043A\u043B\u0430\u0434 \u043F\u0443\u0441\u0442" })
                ] }),
                /* @__PURE__ */ jsxs("div", { style: { fontSize: 12, color: C.inkDim, marginTop: 4 }, children: [
                  "\u041F\u0440\u043E\u0434\u0430\u043D\u043E: ",
                  shop.totalUnitsSold,
                  " \u0448\u0442 \xB7 \u0432\u044B\u0440\u0443\u0447\u043A\u0430 \u043D\u0430 \u0441\u0447\u0451\u0442 \u0418\u041F ",
                  fmt(shop.totalRevenue)
                ] })
              ] }),
              shop.orders.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: C.inkDim, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }, children: "\u0417\u0430\u043A\u0430\u0437\u044B \u0432 \u043F\u0443\u0442\u0438" }),
                shop.orders.map((o) => {
                  const supplier = SUPPLIERS.find((s) => s.id === o.supplierId);
                  const cat = PRODUCT_CATEGORIES.find((c) => c.id === o.category);
                  const secLeft = Math.max(0, Math.ceil((o.arrivesAt - Date.now()) / 1e3));
                  return /* @__PURE__ */ jsxs("div", { style: { background: C.surface, border: `1px solid ${o.status === "customs" ? C.red + "55" : C.border}`, borderRadius: 12, padding: 14, marginBottom: 10 }, children: [
                    /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600 }, children: [
                      /* @__PURE__ */ jsxs("span", { children: [
                        supplier?.flag,
                        " ",
                        o.country,
                        " \xB7 ",
                        cat?.icon,
                        " ",
                        cat?.name
                      ] }),
                      /* @__PURE__ */ jsxs("span", { children: [
                        o.qty,
                        " \u0448\u0442"
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { style: { fontSize: 11.5, color: C.inkDim, margin: "6px 0" }, children: [
                      "\u041E\u043F\u043B\u0430\u0447\u0435\u043D\u043E ",
                      fmt(o.totalCost)
                    ] }),
                    o.status === "shipping" ? /* @__PURE__ */ jsxs("div", { style: { fontSize: 12, color: C.inkFaint }, children: [
                      "\u0412 \u043F\u0443\u0442\u0438: ",
                      Math.floor(secLeft / 60),
                      ":",
                      String(secLeft % 60).padStart(2, "0")
                    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                      /* @__PURE__ */ jsxs("div", { style: { fontSize: 12, color: C.red, marginBottom: 8 }, children: [
                        "\u041D\u0430 \u0442\u0430\u043C\u043E\u0436\u043D\u0435 \u2014 \u043D\u0443\u0436\u043D\u043E \u043E\u043F\u043B\u0430\u0442\u0438\u0442\u044C \u0432\u0432\u043E\u0437\u043D\u043E\u0439 \u043D\u0430\u043B\u043E\u0433 ",
                        fmt(o.customsTax)
                      ] }),
                      /* @__PURE__ */ jsx("button", { onClick: () => payCustoms(shop.id, o.id), disabled: ipCash < o.customsTax, style: { width: "100%", padding: 9, borderRadius: 9, border: "none", fontWeight: 700, fontSize: 12, background: ipCash >= o.customsTax ? C.gold : C.surface2, color: ipCash >= o.customsTax ? "#161207" : C.inkFaint }, children: "\u041E\u043F\u043B\u0430\u0442\u0438\u0442\u044C \u0440\u0430\u0441\u0442\u0430\u043C\u043E\u0436\u043A\u0443 \u0441\u043E \u0441\u0447\u0451\u0442\u0430 \u0418\u041F" })
                    ] })
                  ] }, o.id);
                })
              ] }),
              /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: C.inkDim, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }, children: "\u041C\u0430\u0440\u043A\u0435\u0442\u043F\u043B\u0435\u0439\u0441" }),
              PRODUCT_CATEGORIES.map((cat) => {
                const c = shop.categories?.[cat.id] || { stock: 0, avgCost: 0, listedPrice: 0 };
                const key = `${shop.id}:${cat.id}`;
                const fairLow = c.avgCost * 1.3 * cat.marginMult;
                const fairHigh = c.avgCost * 1.8 * cat.marginMult;
                return /* @__PURE__ */ jsxs("div", { style: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 12 }, children: [
                  /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }, children: [
                    /* @__PURE__ */ jsxs("div", { style: { fontWeight: 700, fontSize: 13 }, children: [
                      cat.icon,
                      " ",
                      cat.name
                    ] }),
                    c.stock > 0 && /* @__PURE__ */ jsxs("div", { style: { fontSize: 11, color: C.inkDim }, children: [
                      "\u043D\u0430 \u0441\u043A\u043B\u0430\u0434\u0435: ",
                      c.stock,
                      " \u0448\u0442"
                    ] })
                  ] }),
                  c.stock > 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsxs("div", { style: { fontSize: 12, color: C.inkDim, marginBottom: 8 }, children: [
                      "\u0421\u0435\u0431\u0435\u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C ",
                      fmt(c.avgCost),
                      "/\u0448\u0442 \xB7 \u043E\u0440\u0438\u0435\u043D\u0442\u0438\u0440 \u0434\u043B\u044F \u0446\u0435\u043D\u044B ",
                      fmt(fairLow),
                      "\u2013",
                      fmt(fairHigh),
                      " \xB7 \u043A\u043E\u043C\u0438\u0441\u0441\u0438\u044F \u043F\u043B\u043E\u0449\u0430\u0434\u043A\u0438 ",
                      Math.round(MARKETPLACE_FEE * 100),
                      "%"
                    ] }),
                    /* @__PURE__ */ jsxs("div", { style: { fontSize: 13, marginBottom: 10 }, children: [
                      "\u0422\u0435\u043A\u0443\u0449\u0430\u044F \u0446\u0435\u043D\u0430: ",
                      /* @__PURE__ */ jsx("b", { style: { fontFamily: "'JetBrains Mono', monospace" }, children: c.listedPrice > 0 ? fmt(c.listedPrice) : "\u043D\u0435 \u0432\u044B\u0441\u0442\u0430\u0432\u043B\u0435\u043D\u0430" }),
                      c.listedPrice > 0 && /* @__PURE__ */ jsx("span", { style: { marginLeft: 8, color: c.listedPrice <= fairHigh ? C.green : C.red, fontSize: 11.5 }, children: c.listedPrice <= c.avgCost * 1.15 * cat.marginMult ? "\u0434\u0435\u043C\u043F\u0438\u043D\u0433 \u2014 \u0440\u0430\u0437\u043B\u0435\u0442\u0438\u0442\u0441\u044F \u0431\u044B\u0441\u0442\u0440\u043E" : c.listedPrice <= fairHigh ? "\u0441\u043F\u0440\u043E\u0441 \u0443\u043C\u0435\u0440\u0435\u043D\u043D\u044B\u0439" : "\u0434\u043E\u0440\u043E\u0433\u043E \u2014 \u0431\u0435\u0440\u0443\u0442 \u043D\u0435\u043E\u0445\u043E\u0442\u043D\u043E" })
                    ] }),
                    /* @__PURE__ */ jsx("input", { value: listedPriceInputs[key] || "", onChange: (e) => setListedPriceInputs((f) => ({ ...f, [key]: e.target.value.replace(/[^0-9.]/g, "") })), placeholder: "\u041D\u043E\u0432\u0430\u044F \u0446\u0435\u043D\u0430 \u0437\u0430 \u0448\u0442\u0443\u043A\u0443", inputMode: "decimal", style: { ...inputStyle, marginBottom: 8 } }),
                    /* @__PURE__ */ jsx("button", { onClick: () => applyListedPrice(shop.id, cat.id), disabled: !listedPriceInputs[key], style: { width: "100%", padding: 10, borderRadius: 10, border: "none", fontWeight: 700, fontSize: 13, background: C.gold, color: "#161207" }, children: "\u0412\u044B\u0441\u0442\u0430\u0432\u0438\u0442\u044C \u0446\u0435\u043D\u0443" })
                  ] }) : /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: C.inkFaint }, children: "\u041F\u0443\u0441\u0442\u043E \u2014 \u0437\u0430\u043A\u0430\u0436\u0438 \u0443 \u043F\u043E\u0441\u0442\u0430\u0432\u0449\u0438\u043A\u0430 \u043D\u0438\u0436\u0435" })
                ] }, cat.id);
              }),
              /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: C.inkDim, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }, children: "\u0420\u0435\u043A\u043B\u0430\u043C\u0430" }),
              /* @__PURE__ */ jsxs("div", { style: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 14 }, children: [
                (() => {
                  const activeAds = (shop.ads || []).filter((a) => Date.now() < a.until);
                  const combinedMult = activeAds.length ? Math.min(6, activeAds.reduce((m, a) => m * a.boostMult, 1)) : 1;
                  return activeAds.length > 0 ? /* @__PURE__ */ jsxs("div", { style: { marginBottom: 12 }, children: [
                    /* @__PURE__ */ jsxs("div", { style: { fontSize: 12.5, color: C.green, fontWeight: 700, marginBottom: 8 }, children: [
                      "\u041A\u0430\u043C\u043F\u0430\u043D\u0438\u0439 \u0430\u043A\u0442\u0438\u0432\u043D\u043E: ",
                      activeAds.length,
                      " \xB7 \u043E\u0431\u0449\u0438\u0439 \u043C\u043D\u043E\u0436\u0438\u0442\u0435\u043B\u044C \xD7",
                      combinedMult.toFixed(1)
                    ] }),
                    activeAds.map((a) => {
                      const tier = AD_TIERS.find((t) => t.id === a.tierId);
                      const minLeft = Math.ceil((a.until - Date.now()) / 6e4);
                      return /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 11.5, color: C.inkDim, padding: "4px 0" }, children: [
                        /* @__PURE__ */ jsx("span", { children: tier?.name }),
                        /* @__PURE__ */ jsxs("span", { children: [
                          "\u0435\u0449\u0451 ",
                          minLeft,
                          " \u043C\u0438\u043D"
                        ] })
                      ] }, a.id);
                    })
                  ] }) : null;
                })(),
                /* @__PURE__ */ jsx("div", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: AD_TIERS.map((t) => /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
                  /* @__PURE__ */ jsxs("button", { onClick: () => runAd(shop.id, t.id), disabled: ipCash < t.cost, style: { flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface2, color: C.ink, textAlign: "left" }, children: [
                    /* @__PURE__ */ jsxs("span", { style: { fontSize: 12.5, fontWeight: 600 }, children: [
                      t.name,
                      /* @__PURE__ */ jsx("br", {}),
                      /* @__PURE__ */ jsxs("span", { style: { fontSize: 11, color: C.inkDim, fontWeight: 400 }, children: [
                        "\xD7",
                        t.boostMult,
                        " \u043A \u0441\u043F\u0440\u043E\u0441\u0443 \u043D\u0430 ",
                        t.durationMin,
                        " \u043C\u0438\u043D"
                      ] })
                    ] }),
                    /* @__PURE__ */ jsx("span", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, flexShrink: 0 }, children: fmt(t.cost) })
                  ] }),
                  /* @__PURE__ */ jsx("button", { onClick: () => runAdMultiple(shop.id, t.id, 3), disabled: ipCash < t.cost * 3, style: { padding: "10px 10px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface2, color: C.gold, fontWeight: 700, fontSize: 12 }, children: "\xD73" })
                ] }, t.id)) }),
                /* @__PURE__ */ jsx("div", { style: { fontSize: 10.5, color: C.inkFaint, marginTop: 8 }, children: "\u041A\u0430\u043C\u043F\u0430\u043D\u0438\u0438 \u0441\u043A\u043B\u0430\u0434\u044B\u0432\u0430\u044E\u0442\u0441\u044F \u2014 \u043C\u043E\u0436\u043D\u043E \u0437\u0430\u043F\u0443\u0441\u043A\u0430\u0442\u044C \u043D\u0435\u0441\u043A\u043E\u043B\u044C\u043A\u043E \u0441\u0440\u0430\u0437\u0443, \u044D\u0444\u0444\u0435\u043A\u0442 \u043F\u0435\u0440\u0435\u043C\u043D\u043E\u0436\u0430\u0435\u0442\u0441\u044F (\u043C\u0430\u043A\u0441\u0438\u043C\u0443\u043C \xD76)." })
              ] }),
              /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: C.inkDim, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }, children: "\u041E\u0444\u043B\u0430\u0439\u043D-\u043C\u0430\u0433\u0430\u0437\u0438\u043D" }),
              !shop.offlineStore ? /* @__PURE__ */ jsxs("div", { style: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 14 }, children: [
                /* @__PURE__ */ jsxs("div", { style: { fontSize: 11.5, color: C.inkDim, marginBottom: 12, lineHeight: 1.6 }, children: [
                  "\u0424\u0438\u0437\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u0442\u043E\u0447\u043A\u0430 \u0434\u0430\u0451\u0442 \u043F\u043E\u0441\u0442\u043E\u044F\u043D\u043D\u044B\u0439 \u0431\u0443\u0441\u0442 \u043F\u0440\u043E\u0434\u0430\u0436 \xD7",
                  OFFLINE_BASE_BOOST,
                  " (\u0434\u043E \xD7",
                  OFFLINE_MAX_BOOST,
                  " \u0441 \u0440\u0435\u043A\u043B\u0430\u043C\u043E\u0439) \u2014 \u043F\u0440\u043E\u0434\u0430\u0451\u0442 \u0434\u043E\u043B\u044E \u043E\u0442 \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u0438 \u043E\u0441\u0442\u0430\u0442\u043A\u0430 \u043A\u0430\u0436\u0434\u044B\u0435 ",
                  OFFLINE_TICK_MS / 6e4,
                  " \u043C\u0438\u043D, \u0442\u043E\u0432\u0430\u0440 \u0442\u043E\u0442 \u0436\u0435, \u0447\u0442\u043E \u043D\u0430 \u0441\u043A\u043B\u0430\u0434\u0435. \u0410\u0440\u0435\u043D\u0434\u0430, \u0437\u0430\u0440\u043F\u043B\u0430\u0442\u0430 \u0438 \u0440\u0430\u0441\u0445\u043E\u0434\u044B \u0441\u043F\u0438\u0441\u044B\u0432\u0430\u044E\u0442\u0441\u044F \u0441\u043E \u0441\u0447\u0451\u0442\u0430 \u0418\u041F \u043F\u043E \u0440\u0430\u0441\u043F\u0438\u0441\u0430\u043D\u0438\u044E \u2014 \u0435\u0441\u043B\u0438 \u043D\u0435\u0447\u0435\u043C \u043F\u043B\u0430\u0442\u0438\u0442\u044C, \u0431\u0443\u0441\u0442 \u0440\u0435\u0437\u043A\u043E \u043F\u0430\u0434\u0430\u0435\u0442, \u0430 \u043F\u043E\u0441\u043B\u0435 \u0442\u0440\u0451\u0445 \u043F\u0440\u043E\u0432\u0430\u043B\u043E\u0432 \u043F\u043E\u0434\u0440\u044F\u0434 \u043C\u0430\u0433\u0430\u0437\u0438\u043D \u0437\u0430\u043A\u0440\u044B\u0432\u0430\u0435\u0442\u0441\u044F. \u041F\u0443\u0441\u0442\u043E\u0439 \u0438\u043B\u0438 \u0441\u043A\u0443\u0434\u043D\u044B\u0439 \u0441\u043A\u043B\u0430\u0434 \u0441\u043E \u0432\u0440\u0435\u043C\u0435\u043D\u0435\u043C \u0442\u043E\u0436\u0435 \u0440\u043E\u043D\u044F\u0435\u0442 \u0431\u0443\u0441\u0442."
                ] }),
                Object.entries(OFFLINE_STORE_TIERS).map(([tierId, tier]) => /* @__PURE__ */ jsxs("div", { style: { border: `1px solid ${C.border}`, borderRadius: 12, padding: 12, marginBottom: 10 }, children: [
                  /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 6 }, children: [
                    /* @__PURE__ */ jsx("div", { style: { fontWeight: 700, fontSize: 13 }, children: tier.name }),
                    /* @__PURE__ */ jsx("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }, children: fmt(tier.openingCost) })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { style: { fontSize: 11, color: C.inkDim, marginBottom: 10 }, children: [
                    "\u041A\u0430\u0436\u0434\u044B\u0435 ",
                    OFFLINE_TICK_MS / 6e4,
                    " \u043C\u0438\u043D: \u0430\u0440\u0435\u043D\u0434\u0430 ",
                    fmt(tier.rent),
                    " \xB7 \u0437\u0430\u0440\u043F\u043B\u0430\u0442\u0430 ",
                    fmt(tier.salary),
                    " \xB7 \u0441\u0432\u0435\u0442 ",
                    fmt(tier.electricity),
                    " \xB7 \u0434\u043E\u043F. \u0440\u0430\u0441\u0445\u043E\u0434\u044B ",
                    fmt(tier.extraMin),
                    "\u2013",
                    fmt(tier.extraMax)
                  ] }),
                  /* @__PURE__ */ jsx("button", { onClick: () => openOfflineStore(shop.id, tierId), disabled: ipCash < tier.openingCost, style: { width: "100%", padding: 10, borderRadius: 10, border: "none", fontWeight: 700, fontSize: 12.5, background: ipCash >= tier.openingCost ? C.gold : C.surface2, color: ipCash >= tier.openingCost ? "#161207" : C.inkFaint }, children: "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u0441\u043E \u0441\u0447\u0451\u0442\u0430 \u0418\u041F" })
                ] }, tierId))
              ] }) : (() => {
                const os = shop.offlineStore;
                const tier = OFFLINE_STORE_TIERS[os.tier];
                const adActive = os.tickCount < os.adUntilTick;
                const effectiveBoost = Math.min(OFFLINE_MAX_BOOST, 1 + os.boostHealth / 100 * (OFFLINE_BASE_BOOST - 1) + (adActive ? 3 : 0));
                const totalStockValue = PRODUCT_CATEGORIES.reduce((sum, cat) => {
                  const c = shop.categories?.[cat.id];
                  if (!c) return sum;
                  const price = c.listedPrice > 0 ? c.listedPrice : c.avgCost * 1.5 * cat.marginMult;
                  return sum + c.stock * price;
                }, 0);
                const secLeft = Math.max(0, Math.ceil((os.nextTickAt - Date.now()) / 1e3));
                return /* @__PURE__ */ jsxs("div", { style: { background: C.surface, border: `1px solid ${os.boostHealth < 25 ? C.red + "55" : C.border}`, borderRadius: 14, padding: 16, marginBottom: 14 }, children: [
                  /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }, children: [
                    /* @__PURE__ */ jsx("div", { style: { fontWeight: 700, fontSize: 14 }, children: tier.name }),
                    /* @__PURE__ */ jsxs("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 15, fontWeight: 700, color: C.gold }, children: [
                      "\xD7",
                      effectiveBoost.toFixed(1),
                      adActive ? " \u{1F4E3}" : ""
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { style: { margin: "8px 0" }, children: [
                    /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 10.5, color: C.inkDim, marginBottom: 3 }, children: [
                      /* @__PURE__ */ jsx("span", { children: "\u0411\u0443\u0441\u0442" }),
                      /* @__PURE__ */ jsxs("span", { children: [
                        Math.round(os.boostHealth),
                        "/100"
                      ] })
                    ] }),
                    /* @__PURE__ */ jsx("div", { style: { height: 5, borderRadius: 3, background: C.surface2, overflow: "hidden" }, children: /* @__PURE__ */ jsx("div", { style: { height: "100%", width: `${os.boostHealth}%`, background: os.boostHealth < 25 ? C.red : os.boostHealth < 60 ? C.gold : C.green } }) })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { style: { fontSize: 11, color: totalStockValue >= tier.wellStockedValue ? C.green : C.inkDim, marginBottom: 4 }, children: [
                    "\u041E\u0441\u0442\u0430\u0442\u043E\u043A \u043D\u0430 \u0441\u043A\u043B\u0430\u0434\u0435: ",
                    fmt(totalStockValue),
                    totalStockValue >= tier.wellStockedValue ? " \u2014 \u0445\u043E\u0440\u043E\u0448\u043E \u0443\u043A\u043E\u043C\u043F\u043B\u0435\u043A\u0442\u043E\u0432\u0430\u043D" : totalStockValue > 0 ? ` (\u0434\u043B\u044F \u0440\u043E\u0441\u0442\u0430 \u0431\u0443\u0441\u0442\u0430 \u043D\u0443\u0436\u043D\u043E \u043E\u0442 ${fmt(tier.wellStockedValue)})` : " \u2014 \u043F\u0443\u0441\u0442\u043E, \u0431\u0443\u0441\u0442 \u0431\u0443\u0434\u0435\u0442 \u043F\u0430\u0434\u0430\u0442\u044C"
                  ] }),
                  /* @__PURE__ */ jsxs("div", { style: { fontSize: 11, color: C.inkFaint, marginBottom: 10 }, children: [
                    "\u041F\u0440\u043E\u0434\u0430\u043D\u043E \u043E\u0444\u043B\u0430\u0439\u043D \u0432\u0441\u0435\u0433\u043E: ",
                    fmt(os.totalOfflineRevenue),
                    " \xB7 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u0440\u0430\u0441\u0447\u0451\u0442 \u0447\u0435\u0440\u0435\u0437 ",
                    Math.floor(secLeft / 60),
                    ":",
                    String(secLeft % 60).padStart(2, "0"),
                    os.missedTicks > 0 ? ` \xB7 \u043F\u0440\u043E\u043F\u0443\u0449\u0435\u043D\u043E \u043E\u043F\u043B\u0430\u0442 \u043F\u043E\u0434\u0440\u044F\u0434: ${os.missedTicks}/3` : ""
                  ] }),
                  /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8 }, children: [
                    /* @__PURE__ */ jsx("button", { onClick: () => runOfflineAd(shop.id), disabled: ipCash < tier.adCost || adActive, style: { flex: 1, padding: 10, borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface2, color: adActive ? C.inkFaint : C.gold, fontWeight: 700, fontSize: 12 }, children: adActive ? "\u0420\u0435\u043A\u043B\u0430\u043C\u0430 \u0430\u043A\u0442\u0438\u0432\u043D\u0430" : `\u0420\u0435\u043A\u043B\u0430\u043C\u0430 +3 \xB7 ${fmt(tier.adCost)}` }),
                    /* @__PURE__ */ jsx("button", { onClick: () => setConfirmCloseOffline(shop.id), style: { padding: "0 14px", borderRadius: 10, border: `1px solid ${C.border}`, background: "transparent", color: C.inkDim, fontSize: 12 }, children: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C" })
                  ] })
                ] });
              })(),
              shop.reviews.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: C.inkDim, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }, children: "\u041E\u0442\u0437\u044B\u0432\u044B" }),
                /* @__PURE__ */ jsx("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }, children: shop.reviews.map((r) => /* @__PURE__ */ jsx("span", { style: { fontSize: 16 }, children: r.positive ? "\u{1F44D}" : "\u{1F44E}" }, r.id)) })
              ] }),
              /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: C.inkDim, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }, children: "\u041F\u043E\u0441\u0442\u0430\u0432\u0449\u0438\u043A\u0438" }),
              SUPPLIERS.map((s) => {
                const selCat = orderCategorySel[`${shop.id}:${s.id}`] || PRODUCT_CATEGORIES[0].id;
                const category = PRODUCT_CATEGORIES.find((c) => c.id === selCat);
                const key = `${shop.id}:${s.id}:${selCat}`;
                const supplierHealth = companyPerfPct(companies, s.companyTicker);
                const unitPrice = s.pricePerUnit * category.priceMult * marketIndex * repPriceMult * supplierHealthPriceMult(supplierHealth);
                return /* @__PURE__ */ jsxs("div", { style: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 12 }, children: [
                  /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between" }, children: [
                    /* @__PURE__ */ jsxs("div", { style: { fontWeight: 700, fontSize: 14 }, children: [
                      s.flag,
                      " ",
                      s.country,
                      " \xB7 ",
                      s.quality
                    ] }),
                    /* @__PURE__ */ jsxs("div", { style: { fontSize: 11, color: C.inkDim }, children: [
                      fmt(unitPrice),
                      "/\u0448\u0442"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { style: { fontSize: 10.5, color: supplierHealth >= 0 ? C.green : C.red, marginTop: 2 }, children: [
                    s.companyTicker,
                    " \u043D\u0430 \u0431\u0438\u0440\u0436\u0435 ",
                    supplierHealth >= 0 ? "+" : "",
                    supplierHealth.toFixed(1),
                    "% \xB7 ",
                    supplierHealth >= 10 ? "\u0441\u043F\u0440\u043E\u0441 \u0432\u044B\u0441\u043E\u043A\u0438\u0439, \u0434\u043E\u0440\u043E\u0436\u0435" : supplierHealth <= -10 ? "\u043F\u0440\u043E\u0441\u0435\u043B, \u0441\u043A\u0438\u0434\u043A\u0438" : "\u0441\u0442\u0430\u0431\u0438\u043B\u044C\u043D\u043E"
                  ] }),
                  /* @__PURE__ */ jsxs("div", { style: { fontSize: 11.5, color: C.inkDim, margin: "6px 0" }, children: [
                    s.desc,
                    " \u0414\u043E\u0441\u0442\u0430\u0432\u043A\u0430 ",
                    s.deliveryDays,
                    " \u0434\u043D.",
                    s.foreign ? " \xB7 \u0440\u0430\u0441\u0442\u0430\u043C\u043E\u0436\u043A\u0430 \u224815% \u043F\u0440\u0438 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u0438" : " \xB7 \u0431\u0435\u0437 \u0433\u0440\u0430\u043D\u0438\u0446\u044B"
                  ] }),
                  /* @__PURE__ */ jsx("div", { style: { display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }, children: PRODUCT_CATEGORIES.map((cat) => /* @__PURE__ */ jsxs(
                    "button",
                    {
                      onClick: () => setOrderCategorySel((f) => ({ ...f, [`${shop.id}:${s.id}`]: cat.id })),
                      style: { padding: "6px 10px", borderRadius: 8, border: `1px solid ${selCat === cat.id ? C.gold : C.border}`, background: selCat === cat.id ? `${C.gold}22` : C.surface2, color: selCat === cat.id ? C.gold : C.inkDim, fontSize: 11.5, fontWeight: 600 },
                      children: [
                        cat.icon,
                        " ",
                        cat.name
                      ]
                    },
                    cat.id
                  )) }),
                  /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8 }, children: [
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        value: orderQtyInputs[key] || "",
                        onChange: (e) => setOrderQtyInputs((f) => ({ ...f, [key]: e.target.value.replace(/[^0-9]/g, "") })),
                        placeholder: "\u041A\u043E\u043B-\u0432\u043E",
                        inputMode: "numeric",
                        style: { ...inputStyle, marginBottom: 0, flex: 1 }
                      }
                    ),
                    /* @__PURE__ */ jsxs(
                      "button",
                      {
                        onClick: () => placeSupplierOrder(shop.id, s.id, selCat),
                        disabled: !orderQtyInputs[key] || Number(orderQtyInputs[key]) * unitPrice > ipCash,
                        style: { padding: "0 16px", borderRadius: 10, border: "none", fontWeight: 700, fontSize: 12.5, background: C.gold, color: "#161207", whiteSpace: "nowrap" },
                        children: [
                          "\u0417\u0430\u043A\u0430\u0437\u0430\u0442\u044C",
                          orderQtyInputs[key] ? ` \xB7 ${fmt(Number(orderQtyInputs[key]) * unitPrice)}` : ""
                        ]
                      }
                    )
                  ] })
                ] }, s.id);
              }),
              /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: C.inkFaint, textAlign: "center", marginBottom: 10 }, children: "\u0417\u0430\u043A\u0443\u043F\u043A\u0438 \u0438\u0434\u0443\u0442 \u0441\u043E \u0441\u0447\u0451\u0442\u0430 \u0418\u041F \u2014 \u043F\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u044C \u043C\u043E\u0436\u043D\u043E \u0432\u043E \u0432\u043A\u043B\u0430\u0434\u043A\u0435 \xAB\u0418\u041F\xBB" }),
              /* @__PURE__ */ jsx("button", { onClick: () => setConfirmCloseResell(shop.id), style: { width: "100%", padding: 12, borderRadius: 10, border: `1px solid ${C.red}55`, background: "transparent", color: C.red, fontSize: 13, fontWeight: 600, marginTop: 4 }, children: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u043C\u0430\u0433\u0430\u0437\u0438\u043D" })
            ] }, shop.id);
          }),
          selectedBizId === null && (!bizPath ? /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { style: { textAlign: "center", padding: "16px 0" }, children: [
              /* @__PURE__ */ jsx(Building2, { size: 30, style: { color: C.gold } }),
              /* @__PURE__ */ jsx("div", { style: { fontSize: 18, fontWeight: 700, marginTop: 8 }, children: playerVenture || resellShops.length ? "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0435\u0449\u0451 \u0431\u0438\u0437\u043D\u0435\u0441" : "\u0417\u0430\u043F\u0443\u0441\u0442\u0438 \u0441\u0432\u043E\u0439 \u0431\u0438\u0437\u043D\u0435\u0441" }),
              /* @__PURE__ */ jsx("div", { style: { fontSize: 13, color: C.inkDim, marginTop: 4 }, children: "\u0421 \u0447\u0435\u0433\u043E \u043D\u0430\u0447\u043D\u0451\u043C?" })
            ] }),
            !playerVenture && /* @__PURE__ */ jsxs("button", { onClick: () => {
              setBizPath("crypto");
              setForm((f) => ({ ...f, kind: "crypto" }));
            }, style: { ...choiceCardStyle(false), width: "100%", marginBottom: 10, display: "block" }, children: [
              /* @__PURE__ */ jsx("div", { style: { fontWeight: 700, fontSize: 15 }, children: "\u041A\u0440\u0438\u043F\u0442\u043E\u0432\u0430\u043B\u044E\u0442\u0430" }),
              /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: C.inkDim, marginTop: 4 }, children: "\u0421\u0430\u043C\u044B\u0439 \u043F\u0440\u043E\u0441\u0442\u043E\u0439 \u0441\u0442\u0430\u0440\u0442 \xB7 \u043B\u0438\u0441\u0442\u0438\u043D\u0433 $300" })
            ] }),
            /* @__PURE__ */ jsxs("button", { onClick: () => setBizPath("real"), style: { ...choiceCardStyle(false), width: "100%", display: "block" }, children: [
              /* @__PURE__ */ jsx("div", { style: { fontWeight: 700, fontSize: 15 }, children: "\u0420\u0435\u0430\u043B\u044C\u043D\u044B\u0439 \u0431\u0438\u0437\u043D\u0435\u0441" }),
              /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: C.inkDim, marginTop: 4 }, children: "\u0417\u0430\u043A\u0443\u043F\u043A\u0438, \u0441\u043A\u043B\u0430\u0434, \u043B\u043E\u0433\u0438\u0441\u0442\u0438\u043A\u0430 \u2014 \u0431\u043B\u0438\u0436\u0435 \u043A \u0440\u0435\u0430\u043B\u044C\u043D\u043E\u0441\u0442\u0438" })
            ] })
          ] }) : bizPath === "real" ? /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("button", { onClick: () => setBizPath(null), style: { background: "none", border: "none", color: C.inkDim, fontSize: 12.5, marginBottom: 12, padding: 0 }, children: "\u2190 \u041D\u0430\u0437\u0430\u0434" }),
            /* @__PURE__ */ jsx("div", { style: { fontSize: 13, color: C.inkDim, marginBottom: 14 }, children: "\u0412\u044B\u0431\u0435\u0440\u0438 \u043D\u0430\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435:" }),
            /* @__PURE__ */ jsxs("button", { onClick: () => setBizPath("resell-setup"), style: { ...choiceCardStyle(false), width: "100%", marginBottom: 10, display: "block" }, children: [
              /* @__PURE__ */ jsx("div", { style: { fontWeight: 700, fontSize: 15 }, children: "\u041F\u0435\u0440\u0435\u043F\u0440\u043E\u0434\u0430\u0436\u0430 \u0442\u0435\u0445\u043D\u0438\u043A\u0438/\u043E\u0434\u0435\u0436\u0434\u044B" }),
              /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: C.inkDim, marginTop: 4 }, children: "\u0417\u0430\u043A\u0443\u043F\u043A\u0430 \u0443 \u043F\u043E\u0441\u0442\u0430\u0432\u0449\u0438\u043A\u043E\u0432 \u2192 \u043C\u0430\u0440\u043A\u0435\u0442\u043F\u043B\u0435\u0439\u0441" })
            ] }),
            [
              { name: "\u041F\u0435\u0440\u0435\u043A\u0443\u043F \u0430\u0432\u0442\u043E", desc: "\u0421\u043A\u0443\u043F\u043A\u0430 \u0438 \u043F\u0435\u0440\u0435\u043F\u0440\u043E\u0434\u0430\u0436\u0430 \u043C\u0430\u0448\u0438\u043D" },
              { name: "\u0422\u0435\u043D\u0434\u0435\u0440\u044B", desc: "\u0413\u043E\u0441\u0437\u0430\u043A\u0443\u043F\u043A\u0438 \u0438 \u043A\u043E\u043D\u0442\u0440\u0430\u043A\u0442\u044B" },
              { name: "\u041F\u0440\u0438\u0432\u043E\u0437 \u0430\u0432\u0442\u043E \u0438\u0437-\u0437\u0430 \u0433\u0440\u0430\u043D\u0438\u0446\u044B", desc: "\u0418\u043C\u043F\u043E\u0440\u0442 \u0438 \u0440\u0430\u0441\u0442\u0430\u043C\u043E\u0436\u043A\u0430 \u043C\u0430\u0448\u0438\u043D" }
            ].map((x) => /* @__PURE__ */ jsx("div", { style: { ...choiceCardStyle(false), opacity: 0.5, marginBottom: 10 }, children: /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { style: { fontWeight: 700, fontSize: 15 }, children: x.name }),
                /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: C.inkDim, marginTop: 4 }, children: x.desc })
              ] }),
              /* @__PURE__ */ jsx("div", { style: { fontSize: 10.5, color: C.inkFaint, border: `1px solid ${C.border}`, borderRadius: 6, padding: "3px 6px" }, children: "\u0441\u043A\u043E\u0440\u043E" })
            ] }) }, x.name))
          ] }) : bizPath === "resell-setup" ? /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("button", { onClick: () => setBizPath("real"), style: { background: "none", border: "none", color: C.inkDim, fontSize: 12.5, marginBottom: 12, padding: 0 }, children: "\u2190 \u041D\u0430\u0437\u0430\u0434" }),
            /* @__PURE__ */ jsxs("div", { style: { textAlign: "center", padding: "8px 0 16px" }, children: [
              /* @__PURE__ */ jsx("div", { style: { fontSize: 18, fontWeight: 700 }, children: "\u041D\u043E\u0432\u044B\u0439 \u043C\u0430\u0433\u0430\u0437\u0438\u043D" }),
              /* @__PURE__ */ jsx("div", { style: { fontSize: 13, color: C.inkDim, marginTop: 4 }, children: "\u0420\u0430\u0437\u043E\u0432\u044B\u0435 \u0440\u0430\u0441\u0445\u043E\u0434\u044B \u043D\u0430 \u0437\u0430\u043F\u0443\u0441\u043A" })
            ] }),
            /* @__PURE__ */ jsx("label", { style: { fontSize: 11, color: C.inkDim, textTransform: "uppercase", letterSpacing: 1 }, children: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u043C\u0430\u0433\u0430\u0437\u0438\u043D\u0430" }),
            /* @__PURE__ */ jsx("input", { value: form.name, onChange: (e) => setForm((f) => ({ ...f, name: e.target.value })), placeholder: "\u041D\u0430\u043F\u0440. \u0413\u0430\u0434\u0436\u0435\u0442\u041C\u0430\u0440\u043A\u0435\u0442", style: inputStyle }),
            (() => {
              const payOptions = [
                ...cash > 0 ? [{ id: "personal", label: `\u041B\u0438\u0447\u043D\u044B\u0439 \u0441\u0447\u0451\u0442 (\u2022\u2022\u2022\u2022 ${cardLast4})` }] : [],
                ...BANK_ACCOUNTS.filter((b) => bankAccounts[b.id] && !bankAccounts[b.id].frozen).map((b) => ({ id: b.id, label: `${b.name} (\u2022\u2022\u2022\u2022 ${bankAccounts[b.id].cardLast4})` })),
                ...greyAccount && !greyAccount.frozen ? [{ id: "grey", label: `${GREY_BANK.name} (\u2022\u2022\u2022\u2022 ${greyAccount.cardLast4})` }] : []
              ];
              if (!payOptions.length) return null;
              return /* @__PURE__ */ jsxs("div", { style: { marginBottom: 14 }, children: [
                /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: C.inkDim, marginBottom: 6 }, children: "\u041F\u043B\u0430\u0442\u0438\u0442\u044C \u043A\u0430\u0440\u0442\u043E\u0439" }),
                /* @__PURE__ */ jsx("select", { value: resolvedPayFrom, onChange: (e) => setPayFromAccount(e.target.value), style: { width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, color: C.ink, fontSize: 13, padding: "10px 10px" }, children: payOptions.map((o) => /* @__PURE__ */ jsx("option", { value: o.id, children: o.label }, o.id)) })
              ] });
            })(),
            /* @__PURE__ */ jsxs("div", { style: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 14 }, children: [
              [
                ["\u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044F \u0438 \u044D\u043A\u0432\u0430\u0439\u0440\u0438\u043D\u0433", RESELL_STARTUP.registration],
                ["\u0410\u0440\u0435\u043D\u0434\u0430 \u043F\u043E\u043C\u0435\u0449\u0435\u043D\u0438\u044F", RESELL_STARTUP.rent],
                ["\u041A\u043E\u043C\u043F\u044C\u044E\u0442\u0435\u0440 \u0438 \u043E\u0431\u043E\u0440\u0443\u0434\u043E\u0432\u0430\u043D\u0438\u0435", RESELL_STARTUP.equipment]
              ].map(([label, val]) => /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13, color: C.inkDim }, children: [
                /* @__PURE__ */ jsx("span", { children: label }),
                /* @__PURE__ */ jsx("span", { style: { color: C.ink, fontFamily: "'JetBrains Mono', monospace" }, children: fmt(val) })
              ] }, label)),
              /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", padding: "10px 0 0", marginTop: 6, borderTop: `1px solid ${C.border}`, fontSize: 14, fontWeight: 700 }, children: [
                /* @__PURE__ */ jsx("span", { children: "\u0418\u0442\u043E\u0433\u043E" }),
                /* @__PURE__ */ jsx("span", { style: { fontFamily: "'JetBrains Mono', monospace" }, children: fmt(RESELL_TOTAL_STARTUP) })
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: C.inkFaint, textAlign: "center", marginBottom: 14 }, children: "\u041E\u043F\u043B\u0430\u0442\u0430 \u2014 \u0441 \u043B\u0438\u0447\u043D\u043E\u0433\u043E \u0441\u0447\u0451\u0442\u0430. \u0414\u0430\u043B\u044C\u0448\u0435 \u0432\u0441\u0435 \u0437\u0430\u043A\u0443\u043F\u043A\u0438 \u0438 \u0432\u044B\u0440\u0443\u0447\u043A\u0430 \u0438\u0434\u0443\u0442 \u0447\u0435\u0440\u0435\u0437 \u0441\u0447\u0451\u0442 \u0418\u041F." }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => startResellBusiness(form.name),
                disabled: resolvedBal < RESELL_TOTAL_STARTUP,
                style: { width: "100%", padding: 14, borderRadius: 12, border: "none", fontWeight: 700, background: resolvedBal >= RESELL_TOTAL_STARTUP ? C.gold : C.surface2, color: resolvedBal >= RESELL_TOTAL_STARTUP ? "#161207" : C.inkFaint },
                children: resolvedBal >= RESELL_TOTAL_STARTUP ? `\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u0431\u0438\u0437\u043D\u0435\u0441 \u2014 ${fmt(RESELL_TOTAL_STARTUP)}` : `\u041D\u0435 \u0445\u0432\u0430\u0442\u0430\u0435\u0442 ${fmt(RESELL_TOTAL_STARTUP - resolvedBal)}`
              }
            )
          ] }) : /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("button", { onClick: () => setBizPath(null), style: { background: "none", border: "none", color: C.inkDim, fontSize: 12.5, marginBottom: 12, padding: 0 }, children: "\u2190 \u041D\u0430\u0437\u0430\u0434" }),
            /* @__PURE__ */ jsxs("div", { style: { textAlign: "center", padding: "8px 0" }, children: [
              /* @__PURE__ */ jsx(Building2, { size: 30, style: { color: C.gold } }),
              /* @__PURE__ */ jsx("div", { style: { fontSize: 18, fontWeight: 700, marginTop: 8 }, children: "\u0417\u0430\u043F\u0443\u0441\u0442\u0438 \u0442\u043E\u043A\u0435\u043D" }),
              /* @__PURE__ */ jsx("div", { style: { fontSize: 13, color: C.inkDim, marginTop: 4 }, children: "\u0412\u044B\u0431\u0435\u0440\u0438 \u043F\u0443\u0442\u044C \u0438 \u043D\u0430\u0437\u043E\u0432\u0438 \u043F\u0440\u043E\u0435\u043A\u0442" })
            ] }),
            /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8, marginBottom: 14 }, children: [
              /* @__PURE__ */ jsxs("button", { onClick: () => setForm((f) => ({ ...f, strategy: "tech" })), style: choiceCardStyle(form.strategy === "tech", C.green), children: [
                /* @__PURE__ */ jsx("div", { style: { fontWeight: 700, fontSize: 13 }, children: "\u0422\u0435\u0445\u043D\u043E\u043B\u043E\u0433\u0438\u0447\u043D\u044B\u0439 \u043F\u0443\u0442\u044C" }),
                /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: C.inkDim, marginTop: 4 }, children: "\u041C\u0435\u0434\u043B\u0435\u043D\u043D\u044B\u0439 \u0447\u0435\u0441\u0442\u043D\u044B\u0439 \u0440\u043E\u0441\u0442, \u0431\u0435\u0437 \u0440\u0438\u0441\u043A\u0430 \u043A\u0440\u0430\u0445\u0430" })
              ] }),
              /* @__PURE__ */ jsxs("button", { onClick: () => setForm((f) => ({ ...f, strategy: "scam" })), style: choiceCardStyle(form.strategy === "scam", C.red), children: [
                /* @__PURE__ */ jsx("div", { style: { fontWeight: 700, fontSize: 13 }, children: "\u0421\u0445\u0435\u043C\u0430 \u043D\u0430 \u0445\u0430\u0439\u043F\u0435" }),
                /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: C.inkDim, marginTop: 4 }, children: "\u0411\u044B\u0441\u0442\u0440\u044B\u0439 \u0440\u0430\u0437\u0433\u043E\u043D, \u0440\u0438\u0441\u043A \u0440\u0430\u0437\u043E\u0431\u043B\u0430\u0447\u0435\u043D\u0438\u044F \u0438 \u043A\u0440\u0430\u0445\u0430" })
              ] })
            ] }),
            /* @__PURE__ */ jsx("label", { style: { fontSize: 11, color: C.inkDim, textTransform: "uppercase", letterSpacing: 1 }, children: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435" }),
            /* @__PURE__ */ jsx("input", { value: form.name, onChange: (e) => setForm((f) => ({ ...f, name: e.target.value })), placeholder: "\u041D\u0430\u043F\u0440. \u041A\u0432\u0430\u043D\u0442\u0443\u043C\u041A\u043E\u0438\u043D", style: inputStyle }),
            /* @__PURE__ */ jsx("label", { style: { fontSize: 11, color: C.inkDim, textTransform: "uppercase", letterSpacing: 1 }, children: "\u0422\u0438\u043A\u0435\u0440" }),
            /* @__PURE__ */ jsx("input", { value: form.ticker, onChange: (e) => setForm((f) => ({ ...f, ticker: e.target.value.toUpperCase().slice(0, 5) })), placeholder: "QNTM", style: { ...inputStyle, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 2 } }),
            (() => {
              const payOptions = [
                ...cash > 0 ? [{ id: "personal", label: `\u041B\u0438\u0447\u043D\u044B\u0439 \u0441\u0447\u0451\u0442 (\u2022\u2022\u2022\u2022 ${cardLast4})` }] : [],
                ...BANK_ACCOUNTS.filter((b) => bankAccounts[b.id] && !bankAccounts[b.id].frozen).map((b) => ({ id: b.id, label: `${b.name} (\u2022\u2022\u2022\u2022 ${bankAccounts[b.id].cardLast4})` })),
                ...greyAccount && !greyAccount.frozen ? [{ id: "grey", label: `${GREY_BANK.name} (\u2022\u2022\u2022\u2022 ${greyAccount.cardLast4})` }] : []
              ];
              if (!payOptions.length) return null;
              return /* @__PURE__ */ jsxs("div", { style: { marginBottom: 14 }, children: [
                /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: C.inkDim, marginBottom: 6 }, children: "\u041F\u043B\u0430\u0442\u0438\u0442\u044C \u043A\u0430\u0440\u0442\u043E\u0439" }),
                /* @__PURE__ */ jsx("select", { value: resolvedPayFrom, onChange: (e) => setPayFromAccount(e.target.value), style: { width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, color: C.ink, fontSize: 13, padding: "10px 10px" }, children: payOptions.map((o) => /* @__PURE__ */ jsx("option", { value: o.id, children: o.label }, o.id)) })
              ] });
            })(),
            /* @__PURE__ */ jsxs("div", { style: { fontSize: 12, color: C.inkDim, marginBottom: 10 }, children: [
              "\u0421\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C \u043B\u0438\u0441\u0442\u0438\u043D\u0433\u0430: ",
              /* @__PURE__ */ jsx("b", { style: { color: C.ink }, children: fmt(listingFee) }),
              resolvedBal < listingFee ? /* @__PURE__ */ jsx("span", { style: { color: C.red }, children: " \u2014 \u043D\u0435 \u0445\u0432\u0430\u0442\u0430\u0435\u0442 \u0441\u0440\u0435\u0434\u0441\u0442\u0432" }) : null
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: createVenture,
                disabled: !form.name.trim() || !form.ticker.trim() || resolvedBal < listingFee,
                style: { width: "100%", padding: 14, borderRadius: 12, border: "none", background: !form.name.trim() || !form.ticker.trim() || resolvedBal < listingFee ? C.surface2 : C.gold, color: !form.name.trim() || !form.ticker.trim() || resolvedBal < listingFee ? C.inkDim : "#161207", fontWeight: 700 },
                children: "\u0417\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u044C \u0442\u043E\u043A\u0435\u043D"
              }
            )
          ] }))
        ] }),
        activeTab === "darkshop" && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { style: { background: "linear-gradient(135deg, #1a1226, #120808)", border: `1px solid #8b3ad655`, borderRadius: 14, padding: 16, marginBottom: 16 }, children: [
            /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: "#c39bf0", textTransform: "uppercase", letterSpacing: 1.5 }, children: "\u0414\u0430\u0440\u043A\u043D\u0435\u0442" }),
            /* @__PURE__ */ jsx("div", { style: { fontSize: 18, fontWeight: 700, marginTop: 4 }, children: darkTab === "services" ? "\u041F\u0440\u0438\u0451\u043C \u043F\u043B\u0430\u0442\u0435\u0436\u0435\u0439" : "\u041C\u0430\u0433\u0430\u0437\u0438\u043D" }),
            blackMarketRoundsDone > 0 && darkTab === "services" && /* @__PURE__ */ jsxs("div", { style: { fontSize: 11, color: C.inkFaint, marginTop: 8 }, children: [
              "\u041A\u0440\u0443\u0433\u043E\u0432 \u043F\u0440\u043E\u0439\u0434\u0435\u043D\u043E: ",
              blackMarketRoundsDone
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 6, marginBottom: 16 }, children: [
            /* @__PURE__ */ jsx("button", { onClick: () => setDarkTab("services"), style: segStyle(darkTab === "services"), children: "\u0423\u0441\u043B\u0443\u0433\u0438" }),
            /* @__PURE__ */ jsx("button", { onClick: () => setDarkTab("goods"), style: segStyle(darkTab === "goods"), children: "\u0422\u043E\u0432\u0430\u0440\u044B" })
          ] }),
          darkTab === "services" && /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { style: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12, marginBottom: 14, fontSize: 11.5, color: C.inkDim, lineHeight: 1.6 }, children: "\u041B\u0435\u043D\u0442\u0430 \u0437\u0430\u043A\u0430\u0437\u043E\u0432 \u043D\u0430 \u043F\u0440\u0438\u0451\u043C \u043F\u043B\u0430\u0442\u0435\u0436\u0435\u0439: $500\u2013$1000 \u2014 \u043A\u043E\u043C\u0438\u0441\u0441\u0438\u044F 20%, \u0434\u043E $5000 \u2014 16%, \u0434\u043E $10 000 \u2014 12%, \u0434\u043E $20 000 \u2014 10%. \u041E\u0441\u0442\u0430\u0432\u043B\u044F\u0435\u0448\u044C \u0441\u0435\u0431\u0435 \u043A\u043E\u043C\u0438\u0441\u0441\u0438\u044E, \u043E\u0441\u0442\u0430\u043B\u044C\u043D\u043E\u0435 \u0437\u0430 10 \u043C\u0438\u043D\u0443\u0442 \u043D\u0443\u0436\u043D\u043E \u0437\u0430\u043A\u0443\u043F\u0438\u0442\u044C \u043A\u0440\u0438\u043F\u0442\u0443 \u0438 \u043E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u043F\u043E\u043B\u0443\u0447\u0430\u0442\u0435\u043B\u044E. \u0421\u0432\u043E\u044F \u043C\u043E\u043D\u0435\u0442\u0430 \u0442\u043E\u0436\u0435 \u043F\u043E\u0434\u0445\u043E\u0434\u0438\u0442 \u2014 \u043D\u043E \u0435\u0441\u043B\u0438 \u0435\u0451 \u043D\u0430\u043A\u0430\u0447\u0438\u0432\u0430\u0442\u044C \u0434\u0435\u043D\u044C\u0433\u0430\u043C\u0438 \u0431\u0435\u0437 \u043F\u043E\u043D\u044F\u0442\u043D\u043E\u0433\u043E \u0432\u044B\u0445\u043E\u0434\u0430, \u0444\u0438\u043D\u043C\u043E\u043D\u0438\u0442\u043E\u0440\u0438\u043D\u0433 \u043E\u0431\u0440\u0430\u0449\u0430\u0435\u0442 \u043D\u0430 \u044D\u0442\u043E \u043E\u0441\u043E\u0431\u043E\u0435 \u0432\u043D\u0438\u043C\u0430\u043D\u0438\u0435. \u0427\u0435\u0440\u0435\u0437 \u0418\u041F \u0431\u0435\u0437 \u0440\u0435\u0430\u043B\u044C\u043D\u043E\u0433\u043E \u043E\u0431\u043E\u0440\u043E\u0442\u0430 \u0432 \u0442\u043E\u0432\u0430\u0440\u043A\u0435 \u2014 \u0441\u043F\u0430\u043B\u044F\u0442 \u0441 \u043F\u0435\u0440\u0432\u043E\u0433\u043E \u0436\u0435 \u0437\u0430\u0445\u043E\u0434\u0430. \u0420\u0430\u0441\u043A\u0440\u0443\u0447\u0435\u043D\u043D\u044B\u0439 \u043C\u0430\u0433\u0430\u0437\u0438\u043D \u0441 \u0445\u043E\u0440\u043E\u0448\u0435\u0439 \u0432\u044B\u0440\u0443\u0447\u043A\u043E\u0439 \u043F\u0440\u0438\u043A\u0440\u044B\u0432\u0430\u0435\u0442 \u0438 \u043F\u043E\u0437\u0432\u043E\u043B\u044F\u0435\u0442 \u0433\u043E\u043D\u044F\u0442\u044C \u0441\u0443\u043C\u043C\u044B \u043A\u0443\u0434\u0430 \u0441\u043F\u043E\u043A\u043E\u0439\u043D\u0435\u0435." }),
            blackMarketHeat > BLACKMARKET_HEAT_THRESHOLD * 0.6 && /* @__PURE__ */ jsx("div", { style: { background: `${C.red}18`, border: `1px solid ${C.red}55`, borderRadius: 10, padding: 10, marginBottom: 14, fontSize: 11.5, color: C.red, textAlign: "center" }, children: "\u26A0 \u0410\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u044C \u043F\u043E\u0434\u043E\u0437\u0440\u0438\u0442\u0435\u043B\u044C\u043D\u043E \u0432\u044B\u0441\u043E\u043A\u0430\u044F \u2014 \u0440\u0438\u0441\u043A \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0438 \u0440\u0430\u0441\u0442\u0451\u0442 \u0441 \u043A\u0430\u0436\u0434\u044B\u043C \u043D\u043E\u0432\u044B\u043C \u043A\u0440\u0443\u0433\u043E\u043C" }),
            !blackMarketRound && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsxs("button", { onClick: refreshBlackMarketOffers, style: { width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: 12, borderRadius: 12, border: `1px solid ${C.border}`, background: C.surface, color: C.gold, fontWeight: 700, fontSize: 13, marginBottom: 14 }, children: [
                /* @__PURE__ */ jsx(RefreshCw, { size: 14 }),
                " \u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C \u043B\u0435\u043D\u0442\u0443"
              ] }),
              blackMarketOffers.length === 0 ? /* @__PURE__ */ jsx("div", { style: { color: C.inkFaint, fontSize: 13, padding: "20px 0", textAlign: "center" }, children: "\u041F\u0443\u0441\u0442\u043E \u2014 \u043E\u0431\u043D\u043E\u0432\u0438 \u043B\u0435\u043D\u0442\u0443, \u0447\u0442\u043E\u0431\u044B \u0443\u0432\u0438\u0434\u0435\u0442\u044C \u0437\u0430\u043A\u0430\u0437\u044B" }) : blackMarketOffers.map((o) => {
                const rate = blackMarketCutRate(o.amount);
                return /* @__PURE__ */ jsxs("button", { onClick: () => selectBlackMarketOffer(o.id), style: { width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "14px 16px", marginBottom: 10, textAlign: "left" }, children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700 }, children: fmt(o.amount) }),
                    /* @__PURE__ */ jsxs("div", { style: { fontSize: 11, color: C.inkDim }, children: [
                      "\u0442\u0435\u0431\u0435 ",
                      Math.round(rate * 100),
                      "% \xB7 ",
                      fmt(Math.round(o.amount * rate))
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx("div", { style: { color: C.gold, fontSize: 12.5, fontWeight: 700 }, children: "\u0412\u0437\u044F\u0442\u044C \u2192" })
                ] }, o.id);
              })
            ] }),
            blackMarketRound && blackMarketRound.stage === "offered" && (() => {
              const rate = blackMarketCutRate(blackMarketRound.amount);
              const options = [
                { id: "ip", label: "\u0418\u041F" },
                ...BANK_ACCOUNTS.filter((b) => bankAccounts[b.id] && !bankAccounts[b.id].frozen).map((b) => ({ id: b.id, label: `${b.name} \xB7 \u043A\u0430\u0440\u0442\u0430` })),
                ...greyAccount && !greyAccount.frozen ? [{ id: "grey", label: `${GREY_BANK.name} \xB7 \u043A\u0430\u0440\u0442\u0430` }] : []
              ];
              return /* @__PURE__ */ jsxs("div", { style: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16 }, children: [
                /* @__PURE__ */ jsx("div", { style: { fontSize: 13, fontWeight: 700, marginBottom: 4 }, children: "\u0412\u0445\u043E\u0434\u044F\u0449\u0438\u0439 \u043F\u043B\u0430\u0442\u0451\u0436" }),
                /* @__PURE__ */ jsx("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 24, fontWeight: 700, margin: "6px 0" }, children: fmt(blackMarketRound.amount) }),
                /* @__PURE__ */ jsxs("div", { style: { fontSize: 11.5, color: C.inkDim, marginBottom: 12 }, children: [
                  "\u041A\u043E\u043C\u0438\u0441\u0441\u0438\u044F ",
                  Math.round(rate * 100),
                  "% \u2014 \u0441\u0435\u0431\u0435 \u043E\u0441\u0442\u0430\u043D\u0435\u0442\u0441\u044F ",
                  fmt(Math.round(blackMarketRound.amount * rate)),
                  ". \u041A\u0443\u0434\u0430 \u043F\u0440\u0438\u043D\u044F\u0442\u044C \u2014 \u043D\u0430 \u0444\u0438\u0437\u043B\u0438\u0446\u043E \u043D\u0443\u0436\u043D\u0430 \u043E\u0442\u043A\u0440\u044B\u0442\u0430\u044F \u043A\u0430\u0440\u0442\u0430."
                ] }),
                options.length === 0 ? /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: C.inkFaint, textAlign: "center", padding: "10px 0" }, children: "\u041D\u0435\u0442 \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B\u0445 \u0441\u0447\u0435\u0442\u043E\u0432 \u2014 \u043E\u0442\u043A\u0440\u043E\u0439 \u043A\u0430\u0440\u0442\u0443 \u0432 \u043B\u044E\u0431\u043E\u043C \u0431\u0430\u043D\u043A\u0435 \u0438\u043B\u0438 \u0441\u0447\u0451\u0442 \u0418\u041F." }) : /* @__PURE__ */ jsx("div", { style: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }, children: options.map((o) => /* @__PURE__ */ jsx("button", { onClick: () => acceptBlackMarketJob(o.id), style: { padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface2, color: C.ink, fontWeight: 600, fontSize: 13, textAlign: "left" }, children: o.label }, o.id)) }),
                /* @__PURE__ */ jsx("button", { onClick: cancelBlackMarketJob, style: { width: "100%", padding: 9, borderRadius: 10, border: `1px solid ${C.border}`, background: "transparent", color: C.inkDim, fontSize: 12 }, children: "\u041E\u0442\u043A\u0430\u0437\u0430\u0442\u044C\u0441\u044F" })
              ] });
            })(),
            blackMarketRound && blackMarketRound.stage === "received" && (() => {
              const rate = blackMarketCutRate(blackMarketRound.amount);
              const forward = Math.round(blackMarketRound.amount * (1 - rate));
              const keep = blackMarketRound.amount - forward;
              const acctLabel = blackMarketRound.accountId === "ip" ? "\u0418\u041F" : blackMarketRound.accountId === "grey" ? GREY_BANK.name : BANK_ACCOUNTS.find((b) => b.id === blackMarketRound.accountId)?.name;
              const secLeft = Math.max(0, Math.ceil((blackMarketRound.deadlineAt - Date.now()) / 1e3));
              const poolType = blackMarketRound.accountId === "ip" ? "ip" : blackMarketRound.accountId === "grey" ? "grey" : "personal";
              const pool = poolType === "ip" ? ipHoldings : poolType === "grey" ? greyHoldings : holdings;
              const cryptoOptions = [
                ...companies.filter((c) => c.sector === "\u041A\u0440\u0438\u043F\u0442\u043E" && !c.isPlayer),
                ...playerVenture && playerVenture.kind === "crypto" ? [playerVenture] : []
              ].map((c) => {
                const isTeher = c.ticker === TEHER_TICKER;
                const requiredValue = forward * (isTeher ? 1 + TEHER_TRANSFER_FEE : 1);
                return { ...c, isTeher, requiredValue, heldQty: pool[c.id]?.qty || 0, heldValue: (pool[c.id]?.qty || 0) * c.price };
              });
              const anyEligible = cryptoOptions.some((c) => c.heldValue >= c.requiredValue);
              return /* @__PURE__ */ jsxs("div", { style: { background: C.surface, border: `1px solid ${C.gold}55`, borderRadius: 14, padding: 16 }, children: [
                /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }, children: [
                  /* @__PURE__ */ jsxs("div", { style: { fontSize: 13, fontWeight: 700 }, children: [
                    "\u0414\u0435\u043D\u044C\u0433\u0438 \u043D\u0430 \xAB",
                    acctLabel,
                    "\xBB"
                  ] }),
                  /* @__PURE__ */ jsxs("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, color: secLeft < 120 ? C.red : C.gold, fontWeight: 700 }, children: [
                    Math.floor(secLeft / 60),
                    ":",
                    String(secLeft % 60).padStart(2, "0")
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 12.5, color: C.inkDim, padding: "4px 0" }, children: [
                  /* @__PURE__ */ jsxs("span", { children: [
                    "\u0421\u0435\u0431\u0435 \u043E\u0441\u0442\u0430\u043D\u0435\u0442\u0441\u044F (",
                    Math.round(rate * 100),
                    "%)"
                  ] }),
                  /* @__PURE__ */ jsx("span", { style: { color: C.green, fontFamily: "'JetBrains Mono', monospace" }, children: fmt(keep) })
                ] }),
                /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 12.5, color: C.inkDim, padding: "4px 0", marginBottom: 10 }, children: [
                  /* @__PURE__ */ jsx("span", { children: "\u041D\u0443\u0436\u043D\u043E \u043A\u0443\u043F\u0438\u0442\u044C \u043A\u0440\u0438\u043F\u0442\u044B \u043D\u0430" }),
                  /* @__PURE__ */ jsx("span", { style: { color: C.ink, fontFamily: "'JetBrains Mono', monospace" }, children: fmt(forward) })
                ] }),
                /* @__PURE__ */ jsxs("div", { style: { fontSize: 11.5, color: C.inkFaint, marginBottom: 10, lineHeight: 1.5 }, children: [
                  "\u0421\u0445\u043E\u0434\u0438 \u043D\u0430 \xAB\u0420\u044B\u043D\u043E\u043A\xBB, \u043A\u0443\u043F\u0438 \u043B\u044E\u0431\u0443\u044E \u0438\u0437 \u044D\u0442\u0438\u0445 \u043C\u043E\u043D\u0435\u0442 \u0447\u0435\u0440\u0435\u0437 \u0441\u0447\u0451\u0442 \xAB",
                  acctLabel,
                  "\xBB \u043D\u0430 \u043D\u0443\u0436\u043D\u0443\u044E \u0441\u0443\u043C\u043C\u0443 \u2014 \u043E\u043D\u0430 \u043F\u043E\u043F\u0430\u0434\u0451\u0442 \u0432 \u0442\u0432\u043E\u0439 \u043E\u0431\u044B\u0447\u043D\u044B\u0439 \u043F\u043E\u0440\u0442\u0444\u0435\u043B\u044C. \u041F\u043E\u0442\u043E\u043C \u0432\u0435\u0440\u043D\u0438\u0441\u044C \u0441\u044E\u0434\u0430 \u0438 \u043E\u0442\u043F\u0440\u0430\u0432\u044C. TEHER \u0434\u0435\u0440\u0436\u0438\u0442 \u043A\u0443\u0440\u0441 $1 \u0431\u0435\u0437 \u0440\u0438\u0441\u043A\u0430, \u043D\u043E \u0437\u0430 \u043F\u0435\u0440\u0435\u0432\u043E\u0434 \u0431\u0435\u0440\u0451\u0442 \u0441\u0432\u043E\u044E \u043A\u043E\u043C\u0438\u0441\u0441\u0438\u044E 1% \u0441\u0432\u0435\u0440\u0445\u0443."
                ] }),
                /* @__PURE__ */ jsx("button", { onClick: () => setActiveTab("market"), style: { width: "100%", padding: 10, borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface2, color: C.gold, fontWeight: 700, fontSize: 12.5, marginBottom: 12 }, children: "\u041F\u0435\u0440\u0435\u0439\u0442\u0438 \u043D\u0430 \u0431\u0438\u0440\u0436\u0443 \u2192" }),
                /* @__PURE__ */ jsx("div", { style: { fontSize: 11.5, color: C.inkFaint, marginBottom: 8 }, children: "\u0427\u0442\u043E \u0443\u0436\u0435 \u043A\u0443\u043F\u043B\u0435\u043D\u043E:" }),
                /* @__PURE__ */ jsx("div", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: cryptoOptions.map((c) => {
                  const eligible = c.heldValue >= c.requiredValue;
                  return /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderRadius: 10, border: `1px solid ${c.isPlayer ? C.red + "55" : C.border}`, background: C.surface2 }, children: [
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsxs("div", { style: { fontWeight: 600, fontSize: 13, color: C.ink }, children: [
                        c.ticker,
                        c.isPlayer ? " \xB7 \u0442\u0432\u043E\u044F \u043C\u043E\u043D\u0435\u0442\u0430" : c.isTeher ? " \xB7 \u043A\u043E\u043C\u0438\u0441\u0441\u0438\u044F 1%" : ""
                      ] }),
                      /* @__PURE__ */ jsxs("div", { style: { fontSize: 11, color: C.inkDim }, children: [
                        "\u0432 \u043F\u043E\u0440\u0442\u0444\u0435\u043B\u0435: ",
                        fmt(c.heldValue),
                        c.isTeher ? ` \xB7 \u043D\u0443\u0436\u043D\u043E ${fmt(c.requiredValue)}` : ""
                      ] })
                    ] }),
                    /* @__PURE__ */ jsx("button", { onClick: () => sendBlackMarketCrypto(c.id), disabled: !eligible, style: { padding: "8px 14px", borderRadius: 9, border: "none", fontWeight: 700, fontSize: 12, background: eligible ? C.gold : C.surface, color: eligible ? "#161207" : C.inkFaint }, children: "\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C" })
                  ] }, c.id);
                }) }),
                !anyEligible && /* @__PURE__ */ jsx("div", { style: { fontSize: 10.5, color: C.inkFaint, marginTop: 8, textAlign: "center" }, children: "\u041F\u043E\u043A\u0430 \u043D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u043D\u0438 \u0432 \u043E\u0434\u043D\u043E\u0439 \u043C\u043E\u043D\u0435\u0442\u0435 \u2014 \u0441\u043D\u0430\u0447\u0430\u043B\u0430 \u043A\u0443\u043F\u0438 \u043D\u0430 \u0431\u0438\u0440\u0436\u0435." }),
                cryptoOptions.some((c) => c.isPlayer) && /* @__PURE__ */ jsx("div", { style: { fontSize: 10.5, color: C.red, marginTop: 8 }, children: "\u0421\u0432\u043E\u044F \u043C\u043E\u043D\u0435\u0442\u0430 \u2014 \u0440\u0438\u0441\u043A \u0437\u0430\u043C\u0435\u0442\u043D\u0435\u0435 \u0444\u0438\u043D\u043C\u043E\u043D\u0438\u0442\u043E\u0440\u0438\u043D\u0433\u0443, \u043E\u0441\u043E\u0431\u0435\u043D\u043D\u043E \u043F\u0440\u0438 \u043F\u043E\u0432\u0442\u043E\u0440\u043D\u043E\u043C \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u0438\u0438." })
              ] });
            })()
          ] }),
          darkTab === "goods" && /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: C.inkDim, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }, children: "\u041A\u0430\u0440\u0442\u044B \u043D\u0430 \u0447\u0443\u0436\u043E\u0435 \u0438\u043C\u044F" }),
            /* @__PURE__ */ jsx("div", { style: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12, marginBottom: 12, fontSize: 11.5, color: C.inkDim, lineHeight: 1.6 }, children: "\u041A\u0430\u0440\u0442\u044B \u0442\u0435\u0445 \u0436\u0435 \u0431\u0430\u043D\u043A\u043E\u0432, \u0447\u0442\u043E \u0443\u0436\u0435 \u0435\u0441\u0442\u044C. \u041C\u043E\u0436\u043D\u043E \u043E\u0431\u043D\u0430\u043B\u0438\u0447\u0438\u0432\u0430\u0442\u044C \u0438 \u0437\u0430\u043A\u0443\u043F\u0430\u0442\u044C \u0441\u0432\u043E\u044E \u043C\u043E\u043D\u0435\u0442\u0443 \u0431\u0435\u0437 \u0440\u0438\u0441\u043A\u0430 \u0434\u043B\u044F \u043B\u0438\u0447\u043D\u043E\u0439 \u0440\u0435\u043F\u0443\u0442\u0430\u0446\u0438\u0438. \u041D\u043E: \u0431\u0435\u0437 \u043F\u0440\u043E\u0433\u0440\u0435\u0432\u0430 \u0431\u0430\u043D\u043A \u043C\u043E\u0436\u0435\u0442 \u0437\u0430\u0431\u043B\u043E\u043A\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u043A\u0430\u0440\u0442\u0443 \u043F\u043E 115-\u0424\u0417, \u0430 \u043F\u0440\u043E\u0434\u0430\u0432\u0435\u0446 \u0438\u043D\u043E\u0433\u0434\u0430 \u0441\u0430\u043C \u0432\u043E\u0440\u0443\u0435\u0442 \u043E\u0441\u0442\u0430\u0442\u043E\u043A. \u041A\u043E\u043C\u0438\u0441\u0441\u0438\u0438 \u0438 \u043B\u0438\u043C\u0438\u0442\u044B \u2014 \u043A\u0430\u043A \u0443 \u043E\u0431\u044B\u0447\u043D\u043E\u0439 \u043A\u0430\u0440\u0442\u044B \u044D\u0442\u043E\u0433\u043E \u0431\u0430\u043D\u043A\u0430." }),
            (() => {
              const payOptions = [
                ...cash > 0 ? [{ id: "personal", label: `\u041B\u0438\u0447\u043D\u044B\u0439 \u0441\u0447\u0451\u0442 (\u2022\u2022\u2022\u2022 ${cardLast4})` }] : [],
                ...BANK_ACCOUNTS.filter((b) => bankAccounts[b.id] && !bankAccounts[b.id].frozen).map((b) => ({ id: b.id, label: `${b.name} (\u2022\u2022\u2022\u2022 ${bankAccounts[b.id].cardLast4})` })),
                ...greyAccount && !greyAccount.frozen ? [{ id: "grey", label: `${GREY_BANK.name} (\u2022\u2022\u2022\u2022 ${greyAccount.cardLast4})` }] : []
              ];
              if (!payOptions.length) return null;
              return /* @__PURE__ */ jsxs("div", { style: { marginBottom: 14 }, children: [
                /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: C.inkDim, marginBottom: 6 }, children: "\u041F\u043B\u0430\u0442\u0438\u0442\u044C \u043A\u0430\u0440\u0442\u043E\u0439" }),
                /* @__PURE__ */ jsx("select", { value: resolvedPayFrom, onChange: (e) => setPayFromAccount(e.target.value), style: { width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, color: C.ink, fontSize: 13, padding: "10px 10px" }, children: payOptions.map((o) => /* @__PURE__ */ jsx("option", { value: o.id, children: o.label }, o.id)) })
              ] });
            })(),
            BANK_ACCOUNTS.map((b) => {
              const price = muleCardPrice(b.id);
              const owned = Object.entries(muleCards).filter(([, c]) => c.bankId === b.id);
              const resolvedBal2 = resolvedPayFrom === "personal" ? cash : resolvedPayFrom === "grey" ? greyAccount?.balance || 0 : bankAccounts[resolvedPayFrom]?.balance || 0;
              return /* @__PURE__ */ jsx("div", { style: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 12 }, children: /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("div", { style: { fontWeight: 700, fontSize: 14 }, children: b.name }),
                  /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: C.inkDim }, children: owned.length > 0 ? `\u0443 \u0442\u0435\u0431\u044F: ${owned.length}` : b.cardName })
                ] }),
                /* @__PURE__ */ jsxs("button", { onClick: () => buyMuleCard(b.id), disabled: resolvedBal2 < price, style: { padding: "9px 14px", borderRadius: 9, border: "none", fontWeight: 700, fontSize: 12.5, background: resolvedBal2 >= price ? C.gold : C.surface2, color: resolvedBal2 >= price ? "#161207" : C.inkFaint }, children: [
                  "\u041A\u0443\u043F\u0438\u0442\u044C \xB7 ",
                  fmt(price)
                ] })
              ] }) }, b.id);
            }),
            /* @__PURE__ */ jsx("div", { style: { fontSize: 10.5, color: C.inkFaint, textAlign: "center" }, children: "\u041A\u0443\u043F\u043B\u0435\u043D\u043D\u044B\u0435 \u043A\u0430\u0440\u0442\u044B \u043F\u043E\u044F\u0432\u044F\u0442\u0441\u044F \u0432 \xAB\u041A\u0430\u0431\u0438\u043D\u0435\u0442 \u2192 \u0411\u0430\u043D\u043A\u0438\xBB, \u0432\u043D\u0443\u0442\u0440\u0438 \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0443\u044E\u0449\u0435\u0433\u043E \u0431\u0430\u043D\u043A\u0430." })
          ] })
        ] }),
        activeTab === "cabinet" && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }, children: [
            /* @__PURE__ */ jsx("button", { onClick: () => setCabinetSubTab("card"), style: segStyle(cabinetSubTab === "card"), children: "\u041A\u0430\u0440\u0442\u0430" }),
            /* @__PURE__ */ jsx("button", { onClick: () => setCabinetSubTab("taxes"), style: segStyle(cabinetSubTab === "taxes"), children: "\u041D\u0430\u043B\u043E\u0433\u0438" }),
            /* @__PURE__ */ jsx("button", { onClick: () => setCabinetSubTab("shop"), style: segStyle(cabinetSubTab === "shop"), children: "\u041C\u0430\u0433\u0430\u0437\u0438\u043D" }),
            /* @__PURE__ */ jsxs("button", { onClick: () => setCabinetSubTab("banks"), style: segStyle(cabinetSubTab === "banks"), children: [
              "\u0411\u0430\u043D\u043A\u0438",
              Object.keys(bankAccounts).length > 0 ? ` (${Object.keys(bankAccounts).length})` : ""
            ] }),
            /* @__PURE__ */ jsx("button", { onClick: () => setCabinetSubTab("history"), style: segStyle(cabinetSubTab === "history"), children: "\u0418\u0441\u0442\u043E\u0440\u0438\u044F" })
          ] }),
          cabinetSubTab === "card" && /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 10, marginBottom: 12 }, children: [
              /* @__PURE__ */ jsxs("button", { onClick: () => setCabinetSubTab("history"), style: { flex: 1, textAlign: "left", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 14, minHeight: 108 }, children: [
                /* @__PURE__ */ jsx("div", { style: { fontSize: 14, fontWeight: 700, marginBottom: 8 }, children: "\u0412\u0441\u0435 \u043E\u043F\u0435\u0440\u0430\u0446\u0438\u0438" }),
                /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: C.inkDim, marginBottom: 4 }, children: "\u0412\u0441\u0435\u0433\u043E \u043F\u043E\u0442\u0440\u0430\u0447\u0435\u043D\u043E" }),
                /* @__PURE__ */ jsx("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700, marginBottom: 8 }, children: fmt(transactions.filter((t) => t.dir === "out").reduce((s, t) => s + t.amount, 0)) }),
                /* @__PURE__ */ jsxs("div", { style: { display: "flex", height: 6, borderRadius: 4, overflow: "hidden" }, children: [
                  /* @__PURE__ */ jsx("div", { style: { flex: 2, background: C.gold } }),
                  /* @__PURE__ */ jsx("div", { style: { flex: 1, background: C.red } }),
                  /* @__PURE__ */ jsx("div", { style: { flex: 1, background: C.green } }),
                  /* @__PURE__ */ jsx("div", { style: { flex: 1, background: "#5AA9E6" } })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { style: { flex: 1, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 14, minHeight: 108 }, children: [
                /* @__PURE__ */ jsx("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }, children: /* @__PURE__ */ jsx("div", { style: { fontSize: 14, fontWeight: 700 }, children: "\u0418\u043C\u0443\u0449\u0435\u0441\u0442\u0432\u043E" }) }),
                Object.entries(ownedItems).filter(([, qty]) => qty > 0).length === 0 ? /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: C.inkFaint }, children: "\u041F\u043E\u043A\u0430 \u043F\u0443\u0441\u0442\u043E \u2014 \u0437\u0430\u0433\u043B\u044F\u043D\u0438 \u0432 \xAB\u041C\u0430\u0433\u0430\u0437\u0438\u043D\xBB" }) : /* @__PURE__ */ jsx("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" }, children: Object.entries(ownedItems).filter(([, qty]) => qty > 0).slice(0, 6).map(([itemId, qty]) => {
                  const item = SHOP_ITEMS.find((i) => i.id === itemId);
                  if (!item) return null;
                  return /* @__PURE__ */ jsxs("div", { style: { width: 34, height: 34, borderRadius: 10, background: C.surface2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, position: "relative" }, children: [
                    item.icon,
                    qty > 1 && /* @__PURE__ */ jsx("div", { style: { position: "absolute", bottom: -4, right: -4, background: C.gold, color: "#161207", borderRadius: 8, fontSize: 9, fontWeight: 700, padding: "1px 4px" }, children: qty })
                  ] }, itemId);
                }) })
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { style: { display: "flex", gap: 8, marginBottom: 16 }, children: [
              { icon: /* @__PURE__ */ jsx(Send, { size: 18 }), label: "\u041F\u0435\u0440\u0435\u0432\u0435\u0441\u0442\u0438", onClick: () => {
                setActiveTab("inspection");
                setIpTab("account");
              } },
              { icon: /* @__PURE__ */ jsx(Landmark, { size: 18 }), label: "\u0411\u0430\u043D\u043A\u0438", onClick: () => {
                setCabinetSubTab("banks");
                setFocusedBankId(null);
              } },
              { icon: /* @__PURE__ */ jsx(Receipt, { size: 18 }), label: "\u041D\u0430\u043B\u043E\u0433\u0438", onClick: () => setCabinetSubTab("taxes") },
              { icon: /* @__PURE__ */ jsx(ShoppingBag, { size: 18 }), label: "\u041C\u0430\u0433\u0430\u0437\u0438\u043D", onClick: () => setCabinetSubTab("shop") }
            ].map((a) => /* @__PURE__ */ jsxs("button", { onClick: a.onClick, style: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "14px 4px" }, children: [
              /* @__PURE__ */ jsx("div", { style: { color: C.gold }, children: a.icon }),
              /* @__PURE__ */ jsx("div", { style: { fontSize: 10.5, color: C.ink, textAlign: "center", lineHeight: 1.2 }, children: a.label })
            ] }, a.label)) }),
            cash > 0 && /* @__PURE__ */ jsx(
              AccountRow,
              {
                icon: /* @__PURE__ */ jsx(Wallet, { size: 20 }),
                iconBg: `${C.gold}22`,
                iconColor: C.gold,
                amount: fmt(cash),
                label: "\u041B\u0438\u0447\u043D\u044B\u0439 \u0441\u0447\u0451\u0442 \xB7 Black",
                badge: `\u2022\u2022\u2022\u2022 ${cardLast4}`
              }
            ),
            /* @__PURE__ */ jsxs("button", { onClick: () => setShowTransferPanel((v) => !v), style: { width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: 10, borderRadius: 12, border: `1px solid ${C.border}`, background: showTransferPanel ? `${C.gold}18` : C.surface, color: showTransferPanel ? C.gold : C.ink, fontWeight: 700, fontSize: 12.5, marginBottom: 10 }, children: [
              /* @__PURE__ */ jsx(Send, { size: 14 }),
              " \u041F\u0435\u0440\u0435\u0432\u043E\u0434\u044B"
            ] }),
            showTransferPanel && (() => {
              const acctOptions = [
                { id: "ip", label: "\u0418\u041F" },
                ...BANK_ACCOUNTS.filter((b) => bankAccounts[b.id]).map((b) => ({ id: b.id, label: b.name })),
                ...greyAccount ? [{ id: "grey", label: GREY_BANK.name }] : []
              ];
              const toOptions = [
                { id: "ip", label: "\u0418\u041F" },
                ...BANK_ACCOUNTS.filter((b) => bankAccounts[b.id]).map((b) => ({ id: b.id, label: b.name })),
                ...greyAccount ? [{ id: "grey", label: GREY_BANK.name }] : []
              ];
              const validFrom = acctOptions.some((o) => o.id === xferFrom) ? xferFrom : acctOptions[0]?.id || "ip";
              return /* @__PURE__ */ jsxs("div", { style: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 14 }, children: [
                /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8, marginBottom: 8 }, children: [
                  /* @__PURE__ */ jsx("select", { value: validFrom, onChange: (e) => setXferFrom(e.target.value), style: { flex: 1, background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 10, color: C.ink, fontSize: 12, padding: "9px 8px" }, children: acctOptions.map((o) => /* @__PURE__ */ jsx("option", { value: o.id, children: o.label }, o.id)) }),
                  /* @__PURE__ */ jsx("select", { value: xferTo, onChange: (e) => setXferTo(e.target.value), style: { flex: 1, background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 10, color: C.ink, fontSize: 12, padding: "9px 8px" }, children: toOptions.filter((o) => o.id !== validFrom).map((o) => /* @__PURE__ */ jsx("option", { value: o.id, children: o.label }, o.id)) })
                ] }),
                /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8 }, children: [
                  /* @__PURE__ */ jsx("input", { value: xferAmount, onChange: (e) => setXferAmount(e.target.value.replace(/[^0-9]/g, "")), placeholder: "\u0421\u0443\u043C\u043C\u0430", inputMode: "numeric", style: { ...inputStyle, marginBottom: 0, flex: 1 } }),
                  /* @__PURE__ */ jsx("button", { onClick: () => universalTransfer(validFrom, xferTo, xferAmount), style: { padding: "0 18px", borderRadius: 10, border: "none", fontWeight: 700, fontSize: 12.5, background: C.gold, color: "#161207" }, children: "\u041F\u0435\u0440\u0435\u0432\u0435\u0441\u0442\u0438" })
                ] }),
                xferFeedback && /* @__PURE__ */ jsx("div", { style: { fontSize: 11.5, color: xferFeedback.ok ? C.green : C.red, marginTop: 8 }, children: xferFeedback.msg })
              ] });
            })(),
            (BANK_ACCOUNTS.some((b) => bankAccounts[b.id]) || greyAccount) && /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: C.inkDim, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }, children: "\u0422\u0432\u043E\u0438 \u043A\u0430\u0440\u0442\u044B" }),
            BANK_ACCOUNTS.filter((b) => bankAccounts[b.id]).map((b) => /* @__PURE__ */ jsx(
              AccountRow,
              {
                icon: /* @__PURE__ */ jsx(CreditCard, { size: 20 }),
                iconBg: `${C.gold}22`,
                iconColor: C.gold,
                amount: fmt(bankAccounts[b.id].balance),
                label: `${b.name} \xB7 ${b.cardName}`,
                badge: bankAccounts[b.id].frozen ? "\u0417\u0430\u043C\u043E\u0440\u043E\u0436\u0435\u043D" : `\u2022\u2022\u2022\u2022 ${bankAccounts[b.id].cardLast4}`,
                onClick: () => {
                  setActiveTab("cabinet");
                  setCabinetSubTab("banks");
                  setFocusedBankId(b.id);
                }
              },
              b.id
            )),
            greyAccount && /* @__PURE__ */ jsx(
              AccountRow,
              {
                icon: /* @__PURE__ */ jsx(CreditCard, { size: 20 }),
                iconBg: "#2a2a4022",
                iconColor: "#8b8bd8",
                amount: fmt(greyAccount.balance),
                label: `${GREY_BANK.name} \xB7 ${GREY_BANK.cardName}`,
                badge: greyAccount.frozen ? "\u0417\u0430\u043C\u043E\u0440\u043E\u0436\u0435\u043D" : `\u2022\u2022\u2022\u2022 ${greyAccount.cardLast4}`,
                onClick: () => {
                  setActiveTab("cabinet");
                  setCabinetSubTab("banks");
                  setFocusedBankId("grey");
                }
              }
            ),
            (ipCash > 0 || resellShops.length > 0) && /* @__PURE__ */ jsx(
              AccountRow,
              {
                icon: /* @__PURE__ */ jsx(Building2, { size: 20 }),
                iconBg: `${C.green}22`,
                iconColor: C.green,
                amount: fmt(ipCash),
                label: "\u0421\u0447\u0451\u0442 \u0418\u041F",
                badge: "\u0411\u0438\u0437\u043D\u0435\u0441",
                onClick: () => {
                  setActiveTab("inspection");
                  setIpTab("account");
                }
              }
            ),
            (bonds.length > 0 || leveragedPositions.length > 0) && /* @__PURE__ */ jsx(
              AccountRow,
              {
                icon: /* @__PURE__ */ jsx(TrendingUp, { size: 20 }),
                iconBg: `${C.gold}22`,
                iconColor: C.gold,
                amount: fmt(bondsValue + leverageValue),
                label: "\u0418\u043D\u0432\u0435\u0441\u0442\u0438\u0446\u0438\u0438 \xB7 \u043E\u0431\u043B\u0438\u0433\u0430\u0446\u0438\u0438 \u0438 \u043F\u043B\u0435\u0447\u0438",
                badge: `${bonds.length + leveragedPositions.length} \u0448\u0442`
              }
            ),
            !promoDismissed && /* @__PURE__ */ jsxs("div", { style: { position: "relative", background: reputation < 40 ? "linear-gradient(135deg, #3a1414, #1a0808)" : "linear-gradient(135deg, #143a1e, #081a0c)", border: `1px solid ${reputation < 40 ? C.red + "40" : C.green + "40"}`, borderRadius: 16, padding: 16, marginTop: 4, marginBottom: 16 }, children: [
              /* @__PURE__ */ jsx("button", { onClick: () => setPromoDismissed(true), style: { position: "absolute", top: 10, right: 10, background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", color: C.ink }, children: /* @__PURE__ */ jsx(X, { size: 12 }) }),
              /* @__PURE__ */ jsx("div", { style: { fontSize: 14, fontWeight: 700, marginBottom: 4, paddingRight: 24 }, children: reputation < 40 ? "\u0420\u0435\u043F\u0443\u0442\u0430\u0446\u0438\u044F \u043F\u0440\u043E\u0441\u0435\u043B\u0430" : reputation >= 80 ? "\u0420\u0435\u043F\u0443\u0442\u0430\u0446\u0438\u044F \u0432 \u043F\u043E\u0440\u044F\u0434\u043A\u0435" : "\u0418\u043D\u0434\u0435\u043A\u0441 \u0440\u044B\u043D\u043A\u0430 \u0441\u0435\u0433\u043E\u0434\u043D\u044F" }),
              /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: C.inkDim, lineHeight: 1.4 }, children: reputation < 40 ? "\u041A\u0440\u0435\u0434\u0438\u0442\u044B \u0434\u043E\u0440\u043E\u0436\u0435, \u043F\u043E\u0441\u0442\u0430\u0432\u0449\u0438\u043A\u0438 \u043D\u0430\u043A\u0440\u0443\u0447\u0438\u0432\u0430\u044E\u0442 \u0446\u0435\u043D\u0443. \u041F\u043E\u0433\u0430\u0441\u0438 \u0434\u043E\u043B\u0433\u0438 \u0438 \u043F\u043E\u0434\u043E\u0436\u0434\u0438 \u2014 \u0440\u0435\u043F\u0443\u0442\u0430\u0446\u0438\u044F \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u0430\u0432\u043B\u0438\u0432\u0430\u0435\u0442\u0441\u044F \u0441\u0430\u043C\u0430." : reputation >= 80 ? "\u0411\u0430\u043D\u043A\u0438 \u043E\u0445\u043E\u0442\u043D\u0435\u0435 \u0434\u0430\u044E\u0442 \u043B\u0438\u043C\u0438\u0442\u044B, \u0438\u043D\u0432\u0435\u0441\u0442\u043E\u0440\u044B \u043E\u0445\u043E\u0442\u043D\u0435\u0435 \u0441\u043E\u0433\u043B\u0430\u0448\u0430\u044E\u0442\u0441\u044F. \u0422\u0430\u043A \u0434\u0435\u0440\u0436\u0430\u0442\u044C." : `\u0417\u0430\u043A\u0443\u043F\u043E\u0447\u043D\u044B\u0435 \u0446\u0435\u043D\u044B \u0441\u0435\u0439\u0447\u0430\u0441 \xD7${marketIndex.toFixed(2)} \u043E\u0442 \u0431\u0430\u0437\u043E\u0432\u044B\u0445 \u2014 \u0435\u0441\u043B\u0438 \u0432\u044B\u0441\u043E\u043A\u043E, \u043B\u0443\u0447\u0448\u0435 \u043F\u043E\u0434\u043E\u0436\u0434\u0430\u0442\u044C.` })
            ] }),
            /* @__PURE__ */ jsxs("div", { style: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 14 }, children: [
              /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: C.inkDim, textTransform: "uppercase", letterSpacing: 1 }, children: "\u041E\u0431\u0449\u0438\u0439 \u043A\u0430\u043F\u0438\u0442\u0430\u043B" }),
              /* @__PURE__ */ jsx("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 28, fontWeight: 700, margin: "4px 0 10px" }, children: fmt(netWorth) }),
              /* @__PURE__ */ jsx(PriceChart, { data: netWorthHistory.length > 1 ? netWorthHistory : [netWorth, netWorth], color: C.gold, height: 90 }),
              /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 12, color: C.inkDim }, children: [
                /* @__PURE__ */ jsxs("span", { children: [
                  "\u041D\u0430 \u0441\u0447\u0451\u0442\u0435: ",
                  /* @__PURE__ */ jsx("b", { style: { color: C.ink }, children: fmt(cash) })
                ] }),
                /* @__PURE__ */ jsxs("span", { children: [
                  "\u0412 \u0430\u043A\u0442\u0438\u0432\u0430\u0445: ",
                  /* @__PURE__ */ jsx("b", { style: { color: C.ink }, children: fmt(netWorth - cash) })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: C.inkDim, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }, children: "\u0410\u043A\u0442\u0438\u0432\u044B" }),
            Object.keys(holdings).length === 0 && /* @__PURE__ */ jsx("div", { style: { color: C.inkFaint, fontSize: 13, padding: "20px 0", textAlign: "center" }, children: "\u041F\u043E\u043A\u0430 \u043F\u0443\u0441\u0442\u043E \u2014 \u043A\u0443\u043F\u0438 \u043F\u0435\u0440\u0432\u0443\u044E \u043F\u043E\u0437\u0438\u0446\u0438\u044E \u043D\u0430 \u0432\u043A\u043B\u0430\u0434\u043A\u0435 \xAB\u0420\u044B\u043D\u043E\u043A\xBB" }),
            Object.entries(holdings).map(([cid, h]) => {
              const c = companies.find((x) => x.id === cid);
              if (!c) return null;
              const value = c.price * h.qty;
              const pnl = (c.price - h.avgCost) * h.qty;
              const pnlPct = h.avgCost > 0 ? (c.price - h.avgCost) / h.avgCost * 100 : 0;
              return /* @__PURE__ */ jsxs("button", { onClick: () => {
                setSelectedId(cid);
                setTradeSide("sell");
                setTradeQty(1);
                setTradeLeverage(1);
                setTradeAccount("personal");
                setTradeQtyMode("qty");
                setTradeAmountInput("");
              }, style: { width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 14px", marginBottom: 8, textAlign: "left" }, children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsxs("div", { style: { fontWeight: 600, fontSize: 14 }, children: [
                    c.ticker,
                    c.isPlayer ? " \xB7 \u0442\u0432\u043E\u044F" : ""
                  ] }),
                  /* @__PURE__ */ jsxs("div", { style: { fontSize: 11, color: C.inkDim }, children: [
                    h.qty.toLocaleString(),
                    " \u0448\u0442 \xB7 \u0441\u0440. ",
                    fmt(h.avgCost)
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { style: { textAlign: "right" }, children: [
                  /* @__PURE__ */ jsx("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }, children: fmt(value) }),
                  /* @__PURE__ */ jsxs("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: pnl >= 0 ? C.green : C.red }, children: [
                    pnl >= 0 ? "+" : "",
                    fmt(pnl),
                    " (",
                    pnlPct >= 0 ? "+" : "",
                    pnlPct.toFixed(1),
                    "%)"
                  ] })
                ] })
              ] }, cid);
            }),
            leveragedPositions.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: C.inkDim, marginBottom: 8, marginTop: 14, textTransform: "uppercase", letterSpacing: 1 }, children: "\u041F\u043E\u0437\u0438\u0446\u0438\u0438 \u0441 \u043F\u043B\u0435\u0447\u043E\u043C" }),
              leveragedPositions.map((p) => {
                const c = companies.find((x) => x.id === p.companyId);
                const price = c ? c.price : p.entryPrice;
                const pnl = (price - p.entryPrice) * p.qty;
                const value = Math.max(0, p.margin + pnl);
                const pnlPct = pnl / p.margin * 100;
                const danger = price <= p.liquidationPrice * 1.05;
                return /* @__PURE__ */ jsxs("div", { style: { background: C.surface, border: `1px solid ${danger ? C.red + "55" : C.border}`, borderRadius: 12, padding: "12px 14px", marginBottom: 8 }, children: [
                  /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 6 }, children: [
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsxs("div", { style: { fontWeight: 600, fontSize: 14 }, children: [
                        p.ticker,
                        " \xB7 \xD7",
                        p.leverage
                      ] }),
                      /* @__PURE__ */ jsxs("div", { style: { fontSize: 11, color: C.inkDim }, children: [
                        p.qty.toLocaleString(),
                        " \u0448\u0442 \xB7 \u0432\u0445\u043E\u0434 ",
                        fmt(p.entryPrice)
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { style: { textAlign: "right" }, children: [
                      /* @__PURE__ */ jsx("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }, children: fmt(value) }),
                      /* @__PURE__ */ jsxs("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: pnl >= 0 ? C.green : C.red }, children: [
                        pnl >= 0 ? "+" : "",
                        fmt(pnl),
                        " (",
                        pnlPct >= 0 ? "+" : "",
                        pnlPct.toFixed(1),
                        "%)"
                      ] })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { style: { fontSize: 11, color: danger ? C.red : C.inkFaint, marginBottom: 8 }, children: [
                    "\u041B\u0438\u043A\u0432\u0438\u0434\u0430\u0446\u0438\u044F \u043F\u0440\u0438 ",
                    fmt(p.liquidationPrice),
                    danger ? " \u2014 \u0441\u043E\u0432\u0441\u0435\u043C \u0431\u043B\u0438\u0437\u043A\u043E!" : ""
                  ] }),
                  /* @__PURE__ */ jsx("button", { onClick: () => closeLeveragedPosition(p.id), style: { width: "100%", padding: 9, borderRadius: 9, border: `1px solid ${C.border}`, background: C.surface2, color: C.ink, fontWeight: 600, fontSize: 12 }, children: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u043F\u043E\u0437\u0438\u0446\u0438\u044E" })
                ] }, p.id);
              })
            ] })
          ] }),
          cabinetSubTab === "taxes" && /* @__PURE__ */ jsxs("div", { children: [
            (() => {
              const payOptions = [
                ...cash > 0 ? [{ id: "personal", label: `\u041B\u0438\u0447\u043D\u044B\u0439 \u0441\u0447\u0451\u0442 (\u2022\u2022\u2022\u2022 ${cardLast4})` }] : [],
                ...BANK_ACCOUNTS.filter((b) => bankAccounts[b.id] && !bankAccounts[b.id].frozen).map((b) => ({ id: b.id, label: `${b.name} (\u2022\u2022\u2022\u2022 ${bankAccounts[b.id].cardLast4})` })),
                ...greyAccount && !greyAccount.frozen ? [{ id: "grey", label: `${GREY_BANK.name} (\u2022\u2022\u2022\u2022 ${greyAccount.cardLast4})` }] : []
              ];
              if (!payOptions.length) return null;
              return /* @__PURE__ */ jsxs("div", { style: { marginBottom: 14 }, children: [
                /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: C.inkDim, marginBottom: 6 }, children: "\u041F\u043B\u0430\u0442\u0438\u0442\u044C \u043A\u0430\u0440\u0442\u043E\u0439" }),
                /* @__PURE__ */ jsx("select", { value: resolvedPayFrom, onChange: (e) => setPayFromAccount(e.target.value), style: { width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, color: C.ink, fontSize: 13, padding: "10px 10px" }, children: payOptions.map((o) => /* @__PURE__ */ jsx("option", { value: o.id, children: o.label }, o.id)) })
              ] });
            })(),
            /* @__PURE__ */ jsxs("div", { style: { background: C.surface, border: `1px solid ${taxOwed > 100 ? C.red + "55" : C.border}`, borderRadius: 14, padding: 16, marginBottom: 14 }, children: [
              /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: C.inkDim, textTransform: "uppercase", letterSpacing: 1 }, children: "\u0417\u0430\u0434\u043E\u043B\u0436\u0435\u043D\u043D\u043E\u0441\u0442\u044C \u043F\u043E \u043D\u0430\u043B\u043E\u0433\u0430\u043C" }),
              /* @__PURE__ */ jsx("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 24, fontWeight: 700, margin: "4px 0", color: taxOwed > 100 ? C.red : C.ink }, children: fmt(taxOwed) }),
              taxOwed > 100 ? /* @__PURE__ */ jsxs("div", { style: { fontSize: 11.5, color: C.red, marginBottom: 10 }, children: [
                "\u0414\u043E\u043B\u0433 \u0431\u043E\u043B\u044C\u0448\u0435 $100 \u2014 \u0435\u0441\u043B\u0438 \u043F\u0440\u043E\u0432\u0438\u0441\u0438\u0442 \u0435\u0449\u0451 ",
                Math.floor((600 - taxOverdueSeconds) / 60),
                ":",
                String((600 - taxOverdueSeconds) % 60).padStart(2, "0"),
                ", \u0434\u0435\u043B\u043E \u043F\u0435\u0440\u0435\u0434\u0430\u0434\u0443\u0442 \u0432 \u0438\u043D\u0441\u043F\u0435\u043A\u0446\u0438\u044E \u0438 \u0432\u044B\u043F\u0438\u0448\u0443\u0442 \u0448\u0442\u0440\u0430\u0444"
              ] }) : /* @__PURE__ */ jsx("div", { style: { fontSize: 11.5, color: C.inkDim, marginBottom: 10 }, children: "\u041F\u0440\u043E\u0431\u043B\u0435\u043C\u044B \u043D\u0430\u0447\u0438\u043D\u0430\u044E\u0442\u0441\u044F \u0442\u043E\u043B\u044C\u043A\u043E \u043F\u0440\u0438 \u0434\u043E\u043B\u0433\u0435 \u0431\u043E\u043B\u044C\u0448\u0435 $100, \u043F\u043E\u0432\u0438\u0441\u0435\u0432\u0448\u0435\u043C \u0434\u043E\u043B\u044C\u0448\u0435 10 \u043C\u0438\u043D\u0443\u0442" }),
              /* @__PURE__ */ jsxs("button", { onClick: () => payTax(taxOwed), disabled: taxOwed <= 0 || (resolvedPayFrom === "personal" ? cash : resolvedPayFrom === "grey" ? greyAccount?.balance || 0 : bankAccounts[resolvedPayFrom]?.balance || 0) <= 0, style: { width: "100%", padding: 11, borderRadius: 10, border: "none", fontWeight: 700, background: taxOwed > 0 && (resolvedPayFrom === "personal" ? cash : resolvedPayFrom === "grey" ? greyAccount?.balance || 0 : bankAccounts[resolvedPayFrom]?.balance || 0) > 0 ? C.gold : C.surface2, color: taxOwed > 0 && (resolvedPayFrom === "personal" ? cash : resolvedPayFrom === "grey" ? greyAccount?.balance || 0 : bankAccounts[resolvedPayFrom]?.balance || 0) > 0 ? "#161207" : C.inkFaint }, children: [
                "\u041E\u043F\u043B\u0430\u0442\u0438\u0442\u044C ",
                fmt(Math.min(resolvedPayFrom === "personal" ? cash : resolvedPayFrom === "grey" ? greyAccount?.balance || 0 : bankAccounts[resolvedPayFrom]?.balance || 0, taxOwed))
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { style: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 14, fontSize: 12, color: C.inkDim, lineHeight: 1.7 }, children: [
              /* @__PURE__ */ jsxs("div", { children: [
                "\u041D\u0414\u0424\u041B \u0441 \u0437\u0430\u0440\u043F\u043B\u0430\u0442\u044B \u2014 ",
                /* @__PURE__ */ jsx("b", { style: { color: C.ink }, children: "13%" }),
                ", \u043D\u0430\u0447\u0438\u0441\u043B\u044F\u0435\u0442\u0441\u044F \u043F\u0440\u0438 \u043A\u0430\u0436\u0434\u043E\u0439 \u0441\u043C\u0435\u043D\u0435"
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                "\u041D\u0430\u043B\u043E\u0433 \u0441 \u043F\u0440\u0438\u0431\u044B\u043B\u0438 \u043F\u043E \u0441\u0434\u0435\u043B\u043A\u0430\u043C \u2014 ",
                /* @__PURE__ */ jsx("b", { style: { color: C.ink }, children: "13%" }),
                " \u0441 \u043F\u043E\u043B\u043E\u0436\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0439 \u0440\u0430\u0437\u043D\u0438\u0446\u044B \u043F\u0440\u0438 \u043F\u0440\u043E\u0434\u0430\u0436\u0435"
              ] }),
              /* @__PURE__ */ jsx("div", { children: "\u041D\u0430\u043B\u043E\u0433 \u043D\u0430 \u0431\u0438\u0437\u043D\u0435\u0441 \u2014 \u22480.025% \u043E\u0442 \u043A\u0430\u043F\u0438\u0442\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u0438 \u043A\u0430\u0436\u0434\u044B\u0435 45 \u0441\u0435\u043A, \u0441\u043F\u0438\u0441\u044B\u0432\u0430\u0435\u0442\u0441\u044F \u0441\u043E \u0441\u0447\u0451\u0442\u0430 \u0418\u041F (\u0435\u0441\u043B\u0438 \u0441\u0432\u043E\u044F \u043A\u043E\u043C\u043F\u0430\u043D\u0438\u044F \u0438\u043B\u0438 \u0442\u043E\u043A\u0435\u043D)" }),
              /* @__PURE__ */ jsx("div", { children: "\u0414\u043E\u043B\u0433 \u0434\u043E $100 \u043C\u043E\u0436\u043D\u043E \u043D\u0435 \u0441\u043F\u0435\u0448\u0438\u0442\u044C \u043F\u043B\u0430\u0442\u0438\u0442\u044C \u2014 \u043D\u0430\u0447\u043D\u0451\u0442 \u0431\u0438\u0442\u044C \u0442\u043E\u043B\u044C\u043A\u043E \u043F\u043E\u0441\u043B\u0435 $100 \u0438 10 \u043C\u0438\u043D\u0443\u0442 \u0431\u0435\u0437 \u043E\u043F\u043B\u0430\u0442\u044B" })
            ] }),
            /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: C.inkDim, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }, children: "\u0418\u0441\u0442\u043E\u0440\u0438\u044F" }),
            taxHistory.length === 0 && /* @__PURE__ */ jsx("div", { style: { color: C.inkFaint, fontSize: 13, padding: "16px 0", textAlign: "center" }, children: "\u041F\u043E\u043A\u0430 \u043D\u0430\u043B\u043E\u0433\u043E\u0432 \u043D\u0435 \u043D\u0430\u0447\u0438\u0441\u043B\u044F\u043B\u043E\u0441\u044C" }),
            taxHistory.map((t) => /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}`, fontSize: 12.5 }, children: [
              /* @__PURE__ */ jsx("span", { style: { color: C.inkDim }, children: t.label }),
              /* @__PURE__ */ jsxs("span", { style: { fontFamily: "'JetBrains Mono', monospace", color: t.kind === "payment" ? C.green : C.red }, children: [
                t.kind === "payment" ? "-" : "+",
                t.amount > 0 ? fmt(t.amount) : "\u2014"
              ] })
            ] }, t.id))
          ] }),
          cabinetSubTab === "shop" && /* @__PURE__ */ jsxs("div", { children: [
            (() => {
              const payOptions = [
                ...cash > 0 ? [{ id: "personal", label: `\u041B\u0438\u0447\u043D\u044B\u0439 \u0441\u0447\u0451\u0442 (\u2022\u2022\u2022\u2022 ${cardLast4})` }] : [],
                ...BANK_ACCOUNTS.filter((b) => bankAccounts[b.id] && !bankAccounts[b.id].frozen).map((b) => ({ id: b.id, label: `${b.name} (\u2022\u2022\u2022\u2022 ${bankAccounts[b.id].cardLast4})` })),
                ...greyAccount && !greyAccount.frozen ? [{ id: "grey", label: `${GREY_BANK.name} (\u2022\u2022\u2022\u2022 ${greyAccount.cardLast4})` }] : []
              ];
              const validPayFrom = payOptions.some((o) => o.id === payFromAccount) ? payFromAccount : payOptions[0]?.id || "personal";
              return /* @__PURE__ */ jsxs("div", { style: { marginBottom: 14 }, children: [
                /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: C.inkDim, marginBottom: 6 }, children: "\u041F\u043B\u0430\u0442\u0438\u0442\u044C \u043A\u0430\u0440\u0442\u043E\u0439" }),
                /* @__PURE__ */ jsx("select", { value: validPayFrom, onChange: (e) => setPayFromAccount(e.target.value), style: { width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, color: C.ink, fontSize: 13, padding: "10px 10px" }, children: payOptions.map((o) => /* @__PURE__ */ jsx("option", { value: o.id, children: o.label }, o.id)) })
              ] });
            })(),
            SHOP_ITEMS.map((item) => {
              const owned = ownedItems[item.id] || 0;
              return /* @__PURE__ */ jsxs("div", { style: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 12 }, children: [
                /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 12 }, children: [
                  /* @__PURE__ */ jsx("div", { style: { fontSize: 26 }, children: item.icon }),
                  /* @__PURE__ */ jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [
                    /* @__PURE__ */ jsx("div", { style: { fontWeight: 600, fontSize: 14 }, children: item.name }),
                    /* @__PURE__ */ jsxs("div", { style: { fontSize: 11, color: C.inkDim }, children: [
                      item.category,
                      owned > 0 ? ` \xB7 \u0435\u0441\u0442\u044C: ${owned}` : ""
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600 }, children: fmt(item.price) })
                ] }),
                /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8, marginTop: 10 }, children: [
                  /* @__PURE__ */ jsx("button", { onClick: () => buyItem(item.id), disabled: (resolvedPayFrom === "personal" ? cash : resolvedPayFrom === "grey" ? greyAccount?.balance || 0 : bankAccounts[resolvedPayFrom]?.balance || 0) < item.price, style: { flex: 1, padding: 9, borderRadius: 9, border: "none", fontWeight: 700, fontSize: 12, background: (resolvedPayFrom === "personal" ? cash : resolvedPayFrom === "grey" ? greyAccount?.balance || 0 : bankAccounts[resolvedPayFrom]?.balance || 0) >= item.price ? C.gold : C.surface2, color: (resolvedPayFrom === "personal" ? cash : resolvedPayFrom === "grey" ? greyAccount?.balance || 0 : bankAccounts[resolvedPayFrom]?.balance || 0) >= item.price ? "#161207" : C.inkFaint }, children: "\u041A\u0443\u043F\u0438\u0442\u044C" }),
                  owned > 0 && /* @__PURE__ */ jsxs("button", { onClick: () => sellItem(item.id), style: { flex: 1, padding: 9, borderRadius: 9, border: `1px solid ${C.border}`, fontWeight: 600, fontSize: 12, background: "transparent", color: C.inkDim }, children: [
                    "\u041F\u0440\u043E\u0434\u0430\u0442\u044C \xB7 ",
                    fmt(Math.round(item.price * 0.65))
                  ] })
                ] })
              ] }, item.id);
            }),
            /* @__PURE__ */ jsx("div", { style: { fontSize: 11.5, color: C.inkFaint, textAlign: "center", padding: "4px 8px" }, children: "\u0418\u043C\u0443\u0449\u0435\u0441\u0442\u0432\u043E \u0441\u0447\u0438\u0442\u0430\u0435\u0442\u0441\u044F \u0432 \u043E\u0431\u0449\u0435\u043C \u043A\u0430\u043F\u0438\u0442\u0430\u043B\u0435 \u043F\u043E \u0446\u0435\u043D\u0435 \u043F\u0435\u0440\u0435\u043F\u0440\u043E\u0434\u0430\u0436\u0438 (65% \u043E\u0442 \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u0438)." })
          ] }),
          cabinetSubTab === "banks" && /* @__PURE__ */ jsx("div", { children: !focusedBankId ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("div", { style: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12, marginBottom: 14, fontSize: 11.5, color: C.inkDim, lineHeight: 1.6 }, children: "\u0423 \u043A\u0430\u0436\u0434\u043E\u0433\u043E \u0431\u0430\u043D\u043A\u0430 \u0441\u0432\u043E\u0439 \u043B\u0438\u0447\u043D\u044B\u0439 \u043A\u0430\u0431\u0438\u043D\u0435\u0442 \u2014 \u0441\u0447\u0451\u0442, \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u044B, \u043A\u0440\u0435\u0434\u0438\u0442 \u0438 \u0432\u043A\u043B\u0430\u0434 \u043D\u0430 \u0441\u0432\u043E\u0438\u0445 \u0443\u0441\u043B\u043E\u0432\u0438\u044F\u0445. \u041E\u0442\u043A\u0440\u043E\u0439 \u0441\u0447\u0451\u0442 \u0438 \u0437\u0430\u0439\u0434\u0438 \u0432\u043D\u0443\u0442\u0440\u044C." }),
            (() => {
              const payOptions = [
                ...cash > 0 ? [{ id: "personal", label: `\u041B\u0438\u0447\u043D\u044B\u0439 \u0441\u0447\u0451\u0442 (\u2022\u2022\u2022\u2022 ${cardLast4})` }] : [],
                ...BANK_ACCOUNTS.filter((b) => bankAccounts[b.id] && !bankAccounts[b.id].frozen).map((b) => ({ id: b.id, label: `${b.name} (\u2022\u2022\u2022\u2022 ${bankAccounts[b.id].cardLast4})` })),
                ...greyAccount && !greyAccount.frozen ? [{ id: "grey", label: `${GREY_BANK.name} (\u2022\u2022\u2022\u2022 ${greyAccount.cardLast4})` }] : []
              ];
              if (!payOptions.length) return null;
              return /* @__PURE__ */ jsxs("div", { style: { marginBottom: 14 }, children: [
                /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: C.inkDim, marginBottom: 6 }, children: "\u041F\u043B\u0430\u0442\u0438\u0442\u044C \u0437\u0430 \u043E\u0442\u043A\u0440\u044B\u0442\u0438\u0435 \u0441\u0447\u0451\u0442\u0430 \u043A\u0430\u0440\u0442\u043E\u0439" }),
                /* @__PURE__ */ jsx("select", { value: resolvedPayFrom, onChange: (e) => setPayFromAccount(e.target.value), style: { width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, color: C.ink, fontSize: 13, padding: "10px 10px" }, children: payOptions.map((o) => /* @__PURE__ */ jsx("option", { value: o.id, children: o.label }, o.id)) })
              ] });
            })(),
            BANK_ACCOUNTS.map((b) => {
              const acct = bankAccounts[b.id];
              const health = companyPerfPct(companies, b.ticker);
              return /* @__PURE__ */ jsxs("div", { style: { background: C.surface, border: `1px solid ${acct?.frozen ? C.red + "55" : C.border}`, borderRadius: 14, padding: 16, marginBottom: 12 }, children: [
                /* @__PURE__ */ jsxs("button", { onClick: () => acct && setFocusedBankId(b.id), style: { width: "100%", background: "none", border: "none", padding: 0, textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: acct ? "pointer" : "default" }, children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("div", { style: { fontWeight: 700, fontSize: 15, color: C.ink }, children: b.name }),
                    /* @__PURE__ */ jsxs("div", { style: { fontSize: 11, color: health >= 0 ? C.green : C.red }, children: [
                      b.ticker,
                      " ",
                      health >= 0 ? "+" : "",
                      health.toFixed(1),
                      "%"
                    ] })
                  ] }),
                  acct ? /* @__PURE__ */ jsxs("div", { style: { textAlign: "right" }, children: [
                    /* @__PURE__ */ jsx("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 15, fontWeight: 700, color: C.ink }, children: fmt(acct.balance) }),
                    /* @__PURE__ */ jsx("div", { style: { fontSize: 10.5, color: C.inkDim }, children: acct.frozen ? "\u0417\u0430\u043C\u043E\u0440\u043E\u0436\u0435\u043D" : `\u2022\u2022\u2022\u2022 ${acct.cardLast4}` })
                  ] }) : /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: C.inkDim }, children: b.cardName })
                ] }),
                !acct ? /* @__PURE__ */ jsx("button", { onClick: () => openBankAccount(b.id), disabled: (resolvedPayFrom === "personal" ? cash : resolvedPayFrom === "grey" ? greyAccount?.balance || 0 : bankAccounts[resolvedPayFrom]?.balance || 0) < b.openingFee, style: { width: "100%", padding: 10, borderRadius: 10, border: "none", fontWeight: 700, fontSize: 12.5, background: (resolvedPayFrom === "personal" ? cash : resolvedPayFrom === "grey" ? greyAccount?.balance || 0 : bankAccounts[resolvedPayFrom]?.balance || 0) >= b.openingFee ? C.gold : C.surface2, color: (resolvedPayFrom === "personal" ? cash : resolvedPayFrom === "grey" ? greyAccount?.balance || 0 : bankAccounts[resolvedPayFrom]?.balance || 0) >= b.openingFee ? "#161207" : C.inkFaint, marginTop: 10 }, children: b.openingFee > 0 ? `\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u0441\u0447\u0451\u0442 \u2014 ${fmt(b.openingFee)}` : "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u0441\u0447\u0451\u0442 \u0431\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u043E" }) : /* @__PURE__ */ jsx("button", { onClick: () => setFocusedBankId(b.id), style: { width: "100%", padding: 9, borderRadius: 9, border: `1px solid ${C.border}`, background: "transparent", color: C.gold, fontWeight: 600, fontSize: 12, marginTop: 10 }, children: "\u041B\u0438\u0447\u043D\u044B\u0439 \u043A\u0430\u0431\u0438\u043D\u0435\u0442 \u2192" })
              ] }, b.id);
            }),
            /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: C.inkDim, marginBottom: 8, marginTop: 6, textTransform: "uppercase", letterSpacing: 1 }, children: "\u0418\u043D\u043E\u0441\u0442\u0440\u0430\u043D\u043D\u044B\u0439 \u0431\u0430\u043D\u043A" }),
            /* @__PURE__ */ jsxs("div", { style: { background: "linear-gradient(135deg, #1a1a2e, #0c0c16)", border: `1px solid ${greyAccount?.frozen ? C.red + "55" : C.border}`, borderRadius: 14, padding: 16, marginBottom: 12 }, children: [
              /* @__PURE__ */ jsxs("button", { onClick: () => greyAccount && setFocusedBankId("grey"), style: { width: "100%", background: "none", border: "none", padding: 0, textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: greyAccount ? "pointer" : "default" }, children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("div", { style: { fontWeight: 700, fontSize: 15, color: C.ink }, children: GREY_BANK.name }),
                  /* @__PURE__ */ jsx("div", { style: { fontSize: 10.5, color: C.inkFaint }, children: "\u043D\u0435 \u043D\u0430 \u0431\u0438\u0440\u0436\u0435" })
                ] }),
                greyAccount ? /* @__PURE__ */ jsxs("div", { style: { textAlign: "right" }, children: [
                  /* @__PURE__ */ jsx("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 15, fontWeight: 700, color: C.ink }, children: fmt(greyAccount.balance) }),
                  /* @__PURE__ */ jsx("div", { style: { fontSize: 10.5, color: C.inkDim }, children: greyAccount.frozen ? "\u0417\u0430\u043C\u043E\u0440\u043E\u0436\u0435\u043D" : `\u2022\u2022\u2022\u2022 ${greyAccount.cardLast4}` })
                ] }) : /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: C.inkDim }, children: GREY_BANK.cardName })
              ] }),
              !greyAccount ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsxs("div", { style: { fontSize: 11.5, color: C.inkDim, lineHeight: 1.6, margin: "10px 0" }, children: [
                  "\u0412\u0445\u043E\u0434\u044F\u0449\u0438\u0435 \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u044B \u0438\u0434\u0443\u0442 \u22482 \u043C\u0438\u043D \xB7 \u043A\u043E\u043C\u0438\u0441\u0441\u0438\u044F \u043D\u0430 \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u044B ",
                  Math.round(GREY_BANK.transferFee * 100),
                  "% \xB7 \u043A\u043E\u043C\u0438\u0441\u0441\u0438\u044F \u043D\u0430 \u0441\u0434\u0435\u043B\u043A\u0438: \u043F\u043E\u043A\u0443\u043F\u043A\u0430 ",
                  Math.round(GREY_BANK.tradeBuyFee * 100),
                  "%, \u043F\u0440\u043E\u0434\u0430\u0436\u0430 ",
                  Math.round(GREY_BANK.tradeSellFee * 100),
                  "% \xB7 \u043A\u0440\u0435\u0434\u0438\u0442\u043E\u0432 \u043D\u0435\u0442, \u0442\u043E\u043B\u044C\u043A\u043E \u0441\u0431\u0435\u0440\u0441\u0447\u0451\u0442 +",
                  Math.round(GREY_BANK.savingsRate * 100),
                  "% \u043A\u0430\u0436\u0434\u044B\u0435 10 \u043C\u0438\u043D"
                ] }),
                /* @__PURE__ */ jsxs("button", { onClick: openGreyAccount, disabled: (resolvedPayFrom === "personal" ? cash : resolvedPayFrom === "grey" ? greyAccount?.balance || 0 : bankAccounts[resolvedPayFrom]?.balance || 0) < GREY_BANK.openingFee, style: { width: "100%", padding: 10, borderRadius: 10, border: "none", fontWeight: 700, fontSize: 12.5, background: (resolvedPayFrom === "personal" ? cash : resolvedPayFrom === "grey" ? greyAccount?.balance || 0 : bankAccounts[resolvedPayFrom]?.balance || 0) >= GREY_BANK.openingFee ? C.gold : C.surface2, color: (resolvedPayFrom === "personal" ? cash : resolvedPayFrom === "grey" ? greyAccount?.balance || 0 : bankAccounts[resolvedPayFrom]?.balance || 0) >= GREY_BANK.openingFee ? "#161207" : C.inkFaint }, children: [
                  "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u0441\u0447\u0451\u0442 \u2014 ",
                  fmt(GREY_BANK.openingFee)
                ] })
              ] }) : /* @__PURE__ */ jsx("button", { onClick: () => setFocusedBankId("grey"), style: { width: "100%", padding: 9, borderRadius: 9, border: `1px solid ${C.border}`, background: "transparent", color: C.gold, fontWeight: 600, fontSize: 12, marginTop: 10 }, children: "\u041B\u0438\u0447\u043D\u044B\u0439 \u043A\u0430\u0431\u0438\u043D\u0435\u0442 \u2192" })
            ] })
          ] }) : focusedBankId === "grey" && greyAccount ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("button", { onClick: () => setFocusedBankId(null), style: { background: "none", border: "none", color: C.inkDim, fontSize: 12.5, marginBottom: 12, padding: 0 }, children: "\u2190 \u041D\u0430\u0437\u0430\u0434 \u043A \u0431\u0430\u043D\u043A\u0430\u043C" }),
            /* @__PURE__ */ jsxs("div", { style: { background: "linear-gradient(135deg, #1a1a2e, #0c0c16)", border: `1px solid ${greyAccount.frozen ? C.red + "55" : C.border}`, borderRadius: 14, padding: 16, marginBottom: 14 }, children: [
              /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" }, children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("div", { style: { fontWeight: 700, fontSize: 15 }, children: GREY_BANK.name }),
                  /* @__PURE__ */ jsx("div", { style: { fontSize: 10.5, color: C.inkFaint }, children: "\u043D\u0435 \u043D\u0430 \u0431\u0438\u0440\u0436\u0435" })
                ] }),
                /* @__PURE__ */ jsxs("div", { style: { textAlign: "right" }, children: [
                  /* @__PURE__ */ jsx("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 17, fontWeight: 700 }, children: fmt(greyAccount.balance) }),
                  /* @__PURE__ */ jsxs("div", { style: { fontSize: 10.5, color: C.inkDim }, children: [
                    GREY_BANK.cardName,
                    " \u2022\u2022\u2022\u2022 ",
                    greyAccount.cardLast4
                  ] })
                ] })
              ] }),
              greyAccount.frozen && /* @__PURE__ */ jsxs("div", { style: { background: `${C.red}18`, border: `1px solid ${C.red}55`, borderRadius: 10, padding: 10, margin: "10px 0", fontSize: 11.5, color: C.red }, children: [
                "\u0424\u0438\u043D\u043C\u043E\u043D\u0438\u0442\u043E\u0440\u0438\u043D\u0433 \u043D\u0430\u043F\u0440\u0430\u0432\u0438\u043B \u0437\u0430\u043F\u0440\u043E\u0441 \u043D\u0430 \u043E\u0431\u044A\u044F\u0441\u043D\u0435\u043D\u0438\u0435 \u043F\u0440\u043E\u0438\u0441\u0445\u043E\u0436\u0434\u0435\u043D\u0438\u044F \u0441\u0440\u0435\u0434\u0441\u0442\u0432. \u0421\u0447\u0451\u0442 \u0437\u0430\u043C\u043E\u0440\u043E\u0436\u0435\u043D \u0435\u0449\u0451 \u2248",
                Math.max(1, Math.ceil((greyAccount.frozenUntil - Date.now()) / 6e4)),
                " \u043C\u0438\u043D."
              ] }),
              greyAccount.pendingTransfers && greyAccount.pendingTransfers.length > 0 && /* @__PURE__ */ jsx("div", { style: { margin: "10px 0" }, children: greyAccount.pendingTransfers.map((p) => {
                const secLeft = Math.max(0, Math.ceil((p.arrivesAt - Date.now()) / 1e3));
                return /* @__PURE__ */ jsxs("div", { style: { fontSize: 11, color: C.inkFaint, display: "flex", justifyContent: "space-between", padding: "3px 0" }, children: [
                  /* @__PURE__ */ jsxs("span", { children: [
                    "\u0412 \u043F\u0443\u0442\u0438: ",
                    fmt(p.amount)
                  ] }),
                  /* @__PURE__ */ jsxs("span", { children: [
                    Math.floor(secLeft / 60),
                    ":",
                    String(secLeft % 60).padStart(2, "0")
                  ] })
                ] }, p.id);
              }) }),
              /* @__PURE__ */ jsxs("div", { style: { fontSize: 10.5, color: C.inkFaint, marginBottom: 10 }, children: [
                "\u0412\u043A\u043B\u0430\u0434 +",
                Math.round(GREY_BANK.savingsRate * 100),
                "% \u043A\u0430\u0436\u0434\u044B\u0435 10 \u043C\u0438\u043D \xB7 \u0441\u043B\u0435\u0434. \u043D\u0430\u0447\u0438\u0441\u043B\u0435\u043D\u0438\u0435 \u0447\u0435\u0440\u0435\u0437 ",
                Math.max(0, Math.ceil((greyAccount.nextSavingsAt - Date.now()) / 6e4)),
                " \u043C\u0438\u043D"
              ] }),
              /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8, marginBottom: 8 }, children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    value: greyTransferInput,
                    onChange: (e) => setGreyTransferInput(e.target.value.replace(/[^0-9]/g, "")),
                    placeholder: "\u0421\u0443\u043C\u043C\u0430",
                    inputMode: "numeric",
                    style: { ...inputStyle, marginBottom: 0, flex: 1 }
                  }
                ),
                /* @__PURE__ */ jsxs(
                  "select",
                  {
                    value: greyTransferDest,
                    onChange: (e) => setGreyTransferDest(e.target.value),
                    style: { background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 10, color: C.ink, fontSize: 12, padding: "0 8px" },
                    children: [
                      /* @__PURE__ */ jsx("option", { value: "ip", children: "\u0418\u041F" }),
                      BANK_ACCOUNTS.filter((b) => bankAccounts[b.id]).map((b) => /* @__PURE__ */ jsx("option", { value: b.id, children: b.name }, b.id))
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8 }, children: [
                /* @__PURE__ */ jsx("button", { onClick: () => depositToGrey(greyTransferInput), disabled: greyAccount.frozen, style: { flex: 1, padding: 9, borderRadius: 9, border: `1px solid ${C.border}`, background: C.surface2, color: C.ink, fontWeight: 600, fontSize: 12 }, children: "\u041F\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u044C (~2 \u043C\u0438\u043D)" }),
                /* @__PURE__ */ jsx("button", { onClick: () => withdrawFromGrey(greyTransferInput), disabled: greyAccount.frozen, style: { flex: 1, padding: 9, borderRadius: 9, border: "none", background: C.gold, color: "#161207", fontWeight: 700, fontSize: 12 }, children: "\u0412\u044B\u0432\u0435\u0441\u0442\u0438" })
              ] }),
              greyFeedback && /* @__PURE__ */ jsx("div", { style: { fontSize: 11.5, color: greyFeedback.ok ? C.green : C.red, marginTop: 8 }, children: greyFeedback.msg })
            ] }),
            /* @__PURE__ */ jsx("div", { style: { fontSize: 11.5, color: C.inkFaint, textAlign: "center" }, children: "\u041A\u0440\u0435\u0434\u0438\u0442\u043E\u0432 \u0437\u0434\u0435\u0441\u044C \u043D\u0435\u0442 \u2014 \u0442\u043E\u043B\u044C\u043A\u043E \u0441\u0447\u0451\u0442 \u0438 \u0432\u043A\u043B\u0430\u0434." })
          ] }) : (() => {
            const b = BANK_ACCOUNTS.find((x) => x.id === focusedBankId);
            const acct = bankAccounts[focusedBankId];
            const bankDef = BANKS.find((x) => x.id === focusedBankId);
            if (!b || !acct) return /* @__PURE__ */ jsx("button", { onClick: () => setFocusedBankId(null), style: { background: "none", border: "none", color: C.inkDim, fontSize: 12.5, padding: 0 }, children: "\u2190 \u041D\u0430\u0437\u0430\u0434 \u043A \u0431\u0430\u043D\u043A\u0430\u043C" });
            const health = companyPerfPct(companies, b.ticker);
            const fb = bankTransferFeedback[b.id];
            const turnoverGrowthMult = 1 + Math.min(1.5, (acct.lifetimeTurnover || 0) / 15e3);
            const grownLimits = bankAccountLimits(b, acct);
            const turnoverLeft = Math.max(0, grownLimits.turnoverCap - acct.turnoverUsed);
            const turnoverResetMin = Math.max(0, Math.ceil((acct.turnoverResetAt - Date.now()) / 6e4));
            const otherOpen = BANK_ACCOUNTS.filter((x) => x.id !== b.id && bankAccounts[x.id]);
            const amt = Number(bankTransferInputs[b.id] || 0);
            const fee = amt > grownLimits.singleLimit ? Math.round(amt * b.overLimitFee) : 0;
            const myLoan = loans.find((l) => l.bankId === b.id);
            const clientRating = bankRatings[b.id] ?? 50;
            const liveLimit = bankLimit(bankDef, cash, netWorth, repFactor, clientRating, health, turnoverGrowthMult);
            const loanFb = loanFeedback[b.id];
            return /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("button", { onClick: () => setFocusedBankId(null), style: { background: "none", border: "none", color: C.inkDim, fontSize: 12.5, marginBottom: 12, padding: 0 }, children: "\u2190 \u041D\u0430\u0437\u0430\u0434 \u043A \u0431\u0430\u043D\u043A\u0430\u043C" }),
              /* @__PURE__ */ jsxs("div", { style: { background: C.surface, border: `1px solid ${acct.frozen ? C.red + "55" : C.border}`, borderRadius: 14, padding: 16, marginBottom: 14 }, children: [
                /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" }, children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("div", { style: { fontWeight: 700, fontSize: 15 }, children: b.name }),
                    /* @__PURE__ */ jsxs("div", { style: { fontSize: 11, color: health >= 0 ? C.green : C.red }, children: [
                      b.ticker,
                      " ",
                      health >= 0 ? "+" : "",
                      health.toFixed(1),
                      "%"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { style: { textAlign: "right" }, children: [
                    /* @__PURE__ */ jsx("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 17, fontWeight: 700 }, children: fmt(acct.balance) }),
                    /* @__PURE__ */ jsxs("div", { style: { fontSize: 10.5, color: C.inkDim }, children: [
                      b.cardName,
                      " \u2022\u2022\u2022\u2022 ",
                      acct.cardLast4
                    ] })
                  ] })
                ] }),
                acct.frozen && /* @__PURE__ */ jsxs("div", { style: { background: `${C.red}18`, border: `1px solid ${C.red}55`, borderRadius: 10, padding: 10, margin: "10px 0", fontSize: 11.5, color: C.red }, children: [
                  "\u0421\u0447\u0451\u0442 \u0437\u0430\u043C\u043E\u0440\u043E\u0436\u0435\u043D \u0444\u0438\u043D\u043C\u043E\u043D\u0438\u0442\u043E\u0440\u0438\u043D\u0433\u043E\u043C \u2014 \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u044B \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B \u0435\u0449\u0451 \u2248",
                  Math.max(1, Math.ceil((acct.frozenUntil - Date.now()) / 6e4)),
                  " \u043C\u0438\u043D, \u043F\u043E\u043A\u0430 \u0438\u0434\u0451\u0442 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0430."
                ] }),
                /* @__PURE__ */ jsxs("div", { style: { margin: "10px 0" }, children: [
                  /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 10.5, color: C.inkDim, marginBottom: 4 }, children: [
                    /* @__PURE__ */ jsxs("span", { children: [
                      "\u041E\u0431\u043E\u0440\u043E\u0442: ",
                      fmt(acct.turnoverUsed),
                      " / ",
                      fmt(grownLimits.turnoverCap)
                    ] }),
                    /* @__PURE__ */ jsxs("span", { children: [
                      "\u0441\u0431\u0440\u043E\u0441 \u0447\u0435\u0440\u0435\u0437 ",
                      turnoverResetMin,
                      " \u043C\u0438\u043D"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx("div", { style: { height: 5, borderRadius: 3, background: C.surface2, overflow: "hidden" }, children: /* @__PURE__ */ jsx("div", { style: { height: "100%", width: `${Math.min(100, acct.turnoverUsed / grownLimits.turnoverCap * 100)}%`, background: turnoverLeft < grownLimits.turnoverCap * 0.15 ? C.red : C.gold } }) }),
                  /* @__PURE__ */ jsxs("div", { style: { fontSize: 10, color: C.inkFaint, marginTop: 4 }, children: [
                    "\u0420\u0430\u0437\u043E\u0432\u044B\u0439 \u043B\u0438\u043C\u0438\u0442 ",
                    fmt(grownLimits.singleLimit),
                    turnoverGrowthMult > 1.02 ? ` (+${Math.round((turnoverGrowthMult - 1) * 100)}% \u0437\u0430 \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u044C)` : " \u2014 \u0431\u0430\u043D\u043A \u043F\u043E\u0434\u043D\u0438\u043C\u0435\u0442 \u043B\u0438\u043C\u0438\u0442, \u0435\u0441\u043B\u0438 \u0440\u0435\u0433\u0443\u043B\u044F\u0440\u043D\u043E \u0438\u043C \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u044C\u0441\u044F"
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { style: { fontSize: 10.5, color: C.inkFaint, marginBottom: 10 }, children: [
                  "\u0412\u043A\u043B\u0430\u0434 +",
                  Math.round(b.savingsRate * 100),
                  "% \u043A\u0430\u0436\u0434\u044B\u0435 10 \u043C\u0438\u043D \xB7 \u0441\u043B\u0435\u0434. \u043D\u0430\u0447\u0438\u0441\u043B\u0435\u043D\u0438\u0435 \u0447\u0435\u0440\u0435\u0437 ",
                  Math.max(0, Math.ceil((acct.nextSavingsAt - Date.now()) / 6e4)),
                  " \u043C\u0438\u043D"
                ] }),
                /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8, marginBottom: 8 }, children: [
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      value: bankTransferInputs[b.id] || "",
                      onChange: (e) => setBankTransferInputs((f) => ({ ...f, [b.id]: e.target.value.replace(/[^0-9]/g, "") })),
                      placeholder: "\u0421\u0443\u043C\u043C\u0430",
                      inputMode: "numeric",
                      style: { ...inputStyle, marginBottom: 0, flex: 1 }
                    }
                  ),
                  /* @__PURE__ */ jsxs(
                    "select",
                    {
                      value: bankTransferDest[b.id] || "ip",
                      onChange: (e) => setBankTransferDest((f) => ({ ...f, [b.id]: e.target.value })),
                      style: { background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 10, color: C.ink, fontSize: 12, padding: "0 8px" },
                      children: [
                        /* @__PURE__ */ jsx("option", { value: "ip", children: "\u0418\u041F" }),
                        otherOpen.map((x) => /* @__PURE__ */ jsx("option", { value: x.id, children: x.name }, x.id))
                      ]
                    }
                  )
                ] }),
                fee > 0 && /* @__PURE__ */ jsxs("div", { style: { fontSize: 10.5, color: C.gold, marginBottom: 8 }, children: [
                  "\u0421\u0432\u0435\u0440\u0445 \u043B\u0438\u043C\u0438\u0442\u0430 ",
                  fmt(grownLimits.singleLimit),
                  " \u2014 \u043A\u043E\u043C\u0438\u0441\u0441\u0438\u044F ",
                  fmt(fee)
                ] }),
                /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8 }, children: [
                  /* @__PURE__ */ jsx("button", { onClick: () => depositToBankAccount(b.id, bankTransferInputs[b.id]), disabled: acct.frozen, style: { flex: 1, padding: 9, borderRadius: 9, border: `1px solid ${C.border}`, background: C.surface2, color: C.ink, fontWeight: 600, fontSize: 12 }, children: "\u041F\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u044C" }),
                  /* @__PURE__ */ jsx("button", { onClick: () => withdrawFromBankAccount(b.id, bankTransferInputs[b.id]), disabled: acct.frozen, style: { flex: 1, padding: 9, borderRadius: 9, border: "none", background: C.gold, color: "#161207", fontWeight: 700, fontSize: 12 }, children: "\u041F\u0435\u0440\u0435\u0432\u0435\u0441\u0442\u0438" })
                ] }),
                fb && /* @__PURE__ */ jsx("div", { style: { fontSize: 11.5, color: fb.ok ? C.green : C.red, marginTop: 8 }, children: fb.msg })
              ] }),
              /* @__PURE__ */ jsxs("div", { style: { fontSize: 12, color: C.inkDim, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }, children: [
                "\u041A\u0440\u0435\u0434\u0438\u0442 \u0432 ",
                b.name
              ] }),
              /* @__PURE__ */ jsx("div", { style: { background: C.surface, border: `1px solid ${myLoan ? C.red + "55" : C.border}`, borderRadius: 14, padding: 16 }, children: myLoan ? (() => {
                const ratio = myLoan.balance / myLoan.principal;
                return /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 700, margin: "4px 0" }, children: fmt(myLoan.balance) }),
                  /* @__PURE__ */ jsxs("div", { style: { fontSize: 11.5, color: C.inkDim, marginBottom: 10 }, children: [
                    "\u041C\u0438\u043D. \u043F\u043B\u0430\u0442\u0451\u0436 ",
                    fmt(myLoan.minPayment),
                    " \xB7 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u0447\u0435\u0440\u0435\u0437 ",
                    myLoan.dueIn,
                    "\u0441",
                    myLoan.paidThisCycle ? /* @__PURE__ */ jsx("span", { style: { color: C.green }, children: " \xB7 \u043E\u043F\u043B\u0430\u0447\u0435\u043D\u043E" }) : null
                  ] }),
                  myLoan.frozen && /* @__PURE__ */ jsxs("div", { style: { fontSize: 11.5, color: C.red, marginBottom: 10, fontWeight: 600 }, children: [
                    "\u26A0 \u0414\u043E\u043B\u0433 \u0432\u044B\u0440\u043E\u0441 \u0434\u043E ",
                    Math.round(ratio * 100),
                    "% \u2014 \u0430\u043A\u0442\u0438\u0432\u044B \u0430\u0440\u0435\u0441\u0442\u043E\u0432\u0430\u043D\u044B",
                    ratio >= 1.6 ? ". \u0415\u0449\u0451 \u043D\u0435\u043C\u043D\u043E\u0433\u043E \u2014 \u0438 \u0431\u0430\u043D\u043A \u0437\u0430\u0431\u0435\u0440\u0451\u0442 \u0431\u0438\u0437\u043D\u0435\u0441 \u0438\u043B\u0438 \u0441\u043F\u0438\u0448\u0435\u0442 \u0434\u0435\u043D\u044C\u0433\u0438." : "."
                  ] }),
                  /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8 }, children: [
                    /* @__PURE__ */ jsx("button", { onClick: () => repayLoan(myLoan.id, myLoan.minPayment), disabled: (resolvedPayFrom === "personal" ? cash : resolvedPayFrom === "grey" ? greyAccount?.balance || 0 : bankAccounts[resolvedPayFrom]?.balance || 0) < myLoan.minPayment, style: { flex: 1, padding: 9, borderRadius: 9, border: "none", background: C.surface2, color: C.ink, fontWeight: 600, fontSize: 12 }, children: "\u041C\u0438\u043D. \u043F\u043B\u0430\u0442\u0451\u0436" }),
                    /* @__PURE__ */ jsx("button", { onClick: () => repayLoan(myLoan.id, myLoan.balance), disabled: (resolvedPayFrom === "personal" ? cash : resolvedPayFrom === "grey" ? greyAccount?.balance || 0 : bankAccounts[resolvedPayFrom]?.balance || 0) < myLoan.balance, style: { flex: 1, padding: 9, borderRadius: 9, border: "none", background: C.green, color: "#06210f", fontWeight: 700, fontSize: 12 }, children: "\u041F\u043E\u0433\u0430\u0441\u0438\u0442\u044C \u0432\u0441\u0451" })
                  ] })
                ] });
              })() : /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsxs("div", { style: { fontSize: 11, color: C.inkDim, marginBottom: 8 }, children: [
                  "\u043B\u0438\u043C\u0438\u0442 \u2248 ",
                  fmt(liveLimit),
                  " \xB7 \u043A\u043B\u0438\u0435\u043D\u0442: ",
                  /* @__PURE__ */ jsxs("span", { style: { color: clientRating >= 65 ? C.green : clientRating >= 35 ? C.gold : C.red }, children: [
                    Math.round(clientRating),
                    "/100"
                  ] })
                ] }),
                /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: C.inkDim, marginBottom: 10 }, children: bankDef?.desc }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    value: loanInputs[b.id] || "",
                    onChange: (e) => setLoanInputs((f) => ({ ...f, [b.id]: e.target.value.replace(/[^0-9]/g, "") })),
                    placeholder: `\u0421\u0443\u043C\u043C\u0430, \u043B\u0438\u043C\u0438\u0442 \u2248 ${fmt(liveLimit)}`,
                    inputMode: "numeric",
                    style: { ...inputStyle, marginBottom: 8 }
                  }
                ),
                /* @__PURE__ */ jsx("button", { onClick: () => applyForLoan(b.id), style: { width: "100%", padding: 11, borderRadius: 10, border: "none", fontWeight: 700, background: C.gold, color: "#161207" }, children: "\u041F\u043E\u0434\u0430\u0442\u044C \u0437\u0430\u044F\u0432\u043A\u0443" }),
                loanFb && /* @__PURE__ */ jsx("div", { style: { fontSize: 11.5, color: loanFb.ok ? C.green : C.red, marginTop: 8 }, children: loanFb.msg })
              ] }) }),
              /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: C.inkDim, marginBottom: 8, marginTop: 14, textTransform: "uppercase", letterSpacing: 1 }, children: b.bond.name }),
              bonds.filter((bd) => bd.bankId === b.id).map((bd) => {
                const matured = Date.now() >= bd.maturesAt;
                const secLeft = Math.max(0, Math.ceil((bd.maturesAt - Date.now()) / 1e3));
                return /* @__PURE__ */ jsxs("div", { style: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 10 }, children: [
                  /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 6 }, children: [
                    /* @__PURE__ */ jsxs("span", { style: { color: C.inkDim }, children: [
                      "\u041D\u043E\u043C\u0438\u043D\u0430\u043B ",
                      fmt(bd.principal)
                    ] }),
                    /* @__PURE__ */ jsx("span", { style: { color: matured ? C.green : C.inkDim }, children: matured ? "\u041F\u043E\u0433\u0430\u0448\u0435\u043D\u0438\u0435 \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u043E" : `\u0434\u043E \u043F\u043E\u0433\u0430\u0448\u0435\u043D\u0438\u044F ${Math.floor(secLeft / 60)}:${String(secLeft % 60).padStart(2, "0")}` })
                  ] }),
                  /* @__PURE__ */ jsx("button", { onClick: () => redeemBond(bd.id), style: { width: "100%", padding: 9, borderRadius: 9, border: "none", fontWeight: 700, fontSize: 12, background: matured ? C.green : C.surface2, color: matured ? "#06210f" : C.inkDim }, children: matured ? `\u041F\u043E\u0433\u0430\u0441\u0438\u0442\u044C \xB7 +${b.bond.totalReturnPct}%` : "\u041F\u043E\u0433\u0430\u0441\u0438\u0442\u044C \u0434\u043E\u0441\u0440\u043E\u0447\u043D\u043E (\u221210%)" })
                ] }, bd.id);
              }),
              /* @__PURE__ */ jsxs("div", { style: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16 }, children: [
                /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: C.inkDim, marginBottom: 8 }, children: b.bond.desc }),
                /* @__PURE__ */ jsxs("div", { style: { fontSize: 11, color: C.inkFaint, marginBottom: 10 }, children: [
                  "\u0414\u043E\u0445\u043E\u0434\u043D\u043E\u0441\u0442\u044C ",
                  b.bond.totalReturnPct,
                  "% \u0437\u0430 ",
                  Math.round(b.bond.termSeconds / 60),
                  " \u043C\u0438\u043D",
                  b.bond.risk > 0 ? ` \xB7 \u0440\u0438\u0441\u043A \u0434\u0435\u0444\u043E\u043B\u0442\u0430 ${Math.round(b.bond.risk * 100)}%` : " \xB7 \u0431\u0435\u0437 \u0440\u0438\u0441\u043A\u0430 \u0434\u0435\u0444\u043E\u043B\u0442\u0430"
                ] }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    value: bondInputs[b.id] || "",
                    onChange: (e) => setBondInputs((f) => ({ ...f, [b.id]: e.target.value.replace(/[^0-9]/g, "") })),
                    placeholder: "\u0421\u0443\u043C\u043C\u0430 \u0441\u043E \u0441\u0447\u0451\u0442\u0430 \u0431\u0430\u043D\u043A\u0430",
                    inputMode: "numeric",
                    style: { ...inputStyle, marginBottom: 8 }
                  }
                ),
                /* @__PURE__ */ jsx("button", { onClick: () => buyBond(b.id), disabled: acct.frozen, style: { width: "100%", padding: 11, borderRadius: 10, border: "none", fontWeight: 700, background: C.gold, color: "#161207" }, children: "\u041A\u0443\u043F\u0438\u0442\u044C \u043E\u0431\u043B\u0438\u0433\u0430\u0446\u0438\u044E" })
              ] }),
              Object.entries(muleCards).filter(([, c]) => c.bankId === b.id).length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: C.inkDim, marginBottom: 8, marginTop: 14, textTransform: "uppercase", letterSpacing: 1 }, children: "\u041A\u0430\u0440\u0442\u044B \u043D\u0430 \u0447\u0443\u0436\u043E\u0435 \u0438\u043C\u044F" }),
                Object.entries(muleCards).filter(([, c]) => c.bankId === b.id).map(([muleId, card]) => {
                  const mfb = muleFeedback[muleId];
                  const mAmt = Number(muleTransferInputs[muleId] || 0);
                  const mFee = mAmt > b.singleLimit ? Math.round(mAmt * b.overLimitFee) : 0;
                  return /* @__PURE__ */ jsxs("div", { style: { background: C.surface, border: `1px solid ${card.frozen ? C.red + "55" : C.gold + "40"}`, borderRadius: 14, padding: 16, marginBottom: 12 }, children: [
                    /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }, children: [
                      /* @__PURE__ */ jsxs("div", { children: [
                        /* @__PURE__ */ jsxs("div", { style: { fontWeight: 700, fontSize: 14 }, children: [
                          "\u2022\u2022\u2022\u2022 ",
                          card.cardLast4
                        ] }),
                        /* @__PURE__ */ jsx("div", { style: { fontSize: 10.5, color: C.inkFaint }, children: "\u043D\u0435 \u0442\u0432\u043E\u0451 \u0438\u043C\u044F" })
                      ] }),
                      /* @__PURE__ */ jsx("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700 }, children: fmt(card.balance) })
                    ] }),
                    card.frozen ? /* @__PURE__ */ jsx("div", { style: { fontSize: 11.5, color: C.red, marginBottom: 8 }, children: "\u0417\u0430\u0431\u043B\u043E\u043A\u0438\u0440\u043E\u0432\u0430\u043D\u0430 \u0431\u0430\u043D\u043A\u043E\u043C \u043F\u043E 115-\u0424\u0417 \u2014 \u0431\u043E\u043B\u044C\u0448\u0435 \u043D\u0435 \u0440\u0430\u0431\u043E\u0442\u0430\u0435\u0442." }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                      /* @__PURE__ */ jsxs("div", { style: { margin: "8px 0" }, children: [
                        /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 10, color: C.inkDim, marginBottom: 3 }, children: [
                          /* @__PURE__ */ jsx("span", { children: "\u041F\u0440\u043E\u0433\u0440\u0435\u0432" }),
                          /* @__PURE__ */ jsxs("span", { children: [
                            Math.round(card.warmth),
                            "/",
                            MULE_WARMUP_TARGET
                          ] })
                        ] }),
                        /* @__PURE__ */ jsx("div", { style: { height: 4, borderRadius: 2, background: C.surface2, overflow: "hidden" }, children: /* @__PURE__ */ jsx("div", { style: { height: "100%", width: `${Math.min(100, card.warmth / MULE_WARMUP_TARGET * 100)}%`, background: card.warmth >= MULE_WARMUP_TARGET ? C.green : C.gold } }) })
                      ] }),
                      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8, marginBottom: 8 }, children: [
                        /* @__PURE__ */ jsx(
                          "input",
                          {
                            value: muleTransferInputs[muleId] || "",
                            onChange: (e) => setMuleTransferInputs((f) => ({ ...f, [muleId]: e.target.value.replace(/[^0-9]/g, "") })),
                            placeholder: "\u0421\u0443\u043C\u043C\u0430",
                            inputMode: "numeric",
                            style: { ...inputStyle, marginBottom: 0, flex: 1 }
                          }
                        ),
                        /* @__PURE__ */ jsx(
                          "select",
                          {
                            value: muleTransferDest[muleId] || "ip",
                            onChange: (e) => setMuleTransferDest((f) => ({ ...f, [muleId]: e.target.value })),
                            style: { background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 10, color: C.ink, fontSize: 12, padding: "0 8px" },
                            children: /* @__PURE__ */ jsx("option", { value: "ip", children: "\u0418\u041F" })
                          }
                        )
                      ] }),
                      mFee > 0 && /* @__PURE__ */ jsxs("div", { style: { fontSize: 10.5, color: C.gold, marginBottom: 8 }, children: [
                        "\u0421\u0432\u0435\u0440\u0445 \u043B\u0438\u043C\u0438\u0442\u0430 ",
                        fmt(b.singleLimit),
                        " \u2014 \u043A\u043E\u043C\u0438\u0441\u0441\u0438\u044F ",
                        fmt(mFee)
                      ] }),
                      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8 }, children: [
                        /* @__PURE__ */ jsx("button", { onClick: () => depositToMuleCard(muleId, muleTransferInputs[muleId]), style: { flex: 1, padding: 9, borderRadius: 9, border: `1px solid ${C.border}`, background: C.surface2, color: C.ink, fontWeight: 600, fontSize: 12 }, children: "\u041F\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u044C" }),
                        /* @__PURE__ */ jsx("button", { onClick: () => withdrawFromMuleCard(muleId, muleTransferInputs[muleId]), style: { flex: 1, padding: 9, borderRadius: 9, border: "none", background: C.gold, color: "#161207", fontWeight: 700, fontSize: 12 }, children: "\u041E\u0431\u043D\u0430\u043B\u0438\u0447\u0438\u0442\u044C" })
                      ] }),
                      mfb && /* @__PURE__ */ jsx("div", { style: { fontSize: 11.5, color: mfb.ok ? C.green : C.red, marginTop: 8 }, children: mfb.msg })
                    ] }),
                    /* @__PURE__ */ jsx("button", { onClick: () => closeMuleCard(muleId), style: { width: "100%", padding: 8, borderRadius: 9, border: `1px solid ${C.border}`, background: "transparent", color: C.inkDim, fontSize: 11.5, marginTop: 8 }, children: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u043A\u0430\u0440\u0442\u0443" })
                  ] }, muleId);
                })
              ] })
            ] });
          })() }),
          cabinetSubTab === "history" && /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 10, marginBottom: 14 }, children: [
              /* @__PURE__ */ jsxs("div", { style: { flex: 1, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 14 }, children: [
                /* @__PURE__ */ jsx("div", { style: { fontSize: 10.5, color: C.inkDim }, children: "\u0420\u0430\u0441\u0445\u043E\u0434" }),
                /* @__PURE__ */ jsxs("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700, color: C.red }, children: [
                  "-",
                  fmt(transactions.filter((t) => t.dir === "out").reduce((s, t) => s + t.amount, 0))
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { style: { flex: 1, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 14 }, children: [
                /* @__PURE__ */ jsx("div", { style: { fontSize: 10.5, color: C.inkDim }, children: "\u0414\u043E\u0445\u043E\u0434" }),
                /* @__PURE__ */ jsxs("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700, color: C.green }, children: [
                  "+",
                  fmt(transactions.filter((t) => t.dir === "in").reduce((s, t) => s + t.amount, 0))
                ] })
              ] })
            ] }),
            transactions.length === 0 && /* @__PURE__ */ jsx("div", { style: { color: C.inkFaint, fontSize: 13, padding: "30px 0", textAlign: "center" }, children: "\u041E\u043F\u0435\u0440\u0430\u0446\u0438\u0439 \u043F\u043E\u043A\u0430 \u043D\u0435 \u0431\u044B\u043B\u043E" }),
            transactions.map((t) => {
              const minsAgo = Math.floor((Date.now() - t.ts) / 6e4);
              const whenLabel = minsAgo < 1 ? "\u0442\u043E\u043B\u044C\u043A\u043E \u0447\u0442\u043E" : minsAgo < 60 ? `${minsAgo} \u043C\u0438\u043D \u043D\u0430\u0437\u0430\u0434` : `${Math.floor(minsAgo / 60)} \u0447 \u043D\u0430\u0437\u0430\u0434`;
              return /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 2px", borderBottom: `1px solid ${C.border}` }, children: [
                /* @__PURE__ */ jsxs("div", { style: { minWidth: 0 }, children: [
                  /* @__PURE__ */ jsx("div", { style: { fontSize: 13, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }, children: t.label }),
                  /* @__PURE__ */ jsx("div", { style: { fontSize: 10.5, color: C.inkFaint, marginTop: 2 }, children: whenLabel })
                ] }),
                /* @__PURE__ */ jsxs("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600, color: t.dir === "in" ? C.green : C.red, flexShrink: 0, marginLeft: 10 }, children: [
                  t.dir === "in" ? "+" : "-",
                  fmt(t.amount)
                ] })
              ] }, t.id);
            })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { style: { display: "flex", borderTop: `1px solid ${C.border}`, background: C.surface }, children: [
        { key: "market", label: "\u0420\u044B\u043D\u043E\u043A", icon: TrendingUp },
        { key: "news", label: "\u0421\u043E\u0446\u0441\u0435\u0442\u044C", icon: MessageCircle },
        { key: "job", label: "\u0420\u0430\u0431\u043E\u0442\u0430", icon: Briefcase },
        { key: "inspection", label: "\u0418\u041F", icon: ShieldAlert },
        { key: "company", label: "\u0411\u0438\u0437\u043D\u0435\u0441", icon: Building2 },
        { key: "darkshop", label: "\u0414\u0430\u0440\u043A\u043D\u0435\u0442", icon: EyeOff },
        { key: "cabinet", label: "\u041A\u0430\u0431\u0438\u043D\u0435\u0442", icon: CreditCard }
      ].map((t) => {
        const Icon = t.icon;
        const active = activeTab === t.key;
        return /* @__PURE__ */ jsxs("button", { onClick: () => setActiveTab(t.key), style: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "8px 0 9px", background: "none", border: "none", color: active ? C.gold : C.inkFaint }, children: [
          /* @__PURE__ */ jsx(Icon, { size: 17 }),
          /* @__PURE__ */ jsx("span", { style: { fontSize: 9, fontWeight: active ? 700 : 500 }, children: t.label })
        ] }, t.key);
      }) }),
      selectedId && selectedCompany && /* @__PURE__ */ jsx("div", { style: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 50 }, onClick: () => setSelectedId(null), children: /* @__PURE__ */ jsxs("div", { onClick: (e) => e.stopPropagation(), style: { width: "100%", maxWidth: 430, background: C.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: "85vh", overflowY: "auto" }, children: [
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }, children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: C.inkDim }, children: selectedCompany.sector }),
            /* @__PURE__ */ jsx("div", { style: { fontSize: 18, fontWeight: 700 }, children: selectedCompany.name })
          ] }),
          /* @__PURE__ */ jsx("button", { onClick: () => setSelectedId(null), style: { background: C.surface2, border: "none", borderRadius: 8, padding: 8, color: C.inkDim }, children: /* @__PURE__ */ jsx(X, { size: 16 }) })
        ] }),
        /* @__PURE__ */ jsx("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 26, fontWeight: 700 }, children: fmt(selectedCompany.price) }),
        /* @__PURE__ */ jsx(CandleChart, { companyId: selectedCompany.id, engineRef, candles: selectedCompany.candles, height: 210 }),
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8, margin: "16px 0" }, children: [
          /* @__PURE__ */ jsx("button", { onClick: () => setTradeSide("buy"), style: { flex: 1, padding: 10, borderRadius: 10, border: "none", background: tradeSide === "buy" ? C.green : C.surface2, color: tradeSide === "buy" ? "#06210f" : C.inkDim, fontWeight: 700 }, children: "\u041A\u0443\u043F\u0438\u0442\u044C" }),
          /* @__PURE__ */ jsx("button", { onClick: () => {
            setTradeSide("sell");
            setTradeLeverage(1);
          }, style: { flex: 1, padding: 10, borderRadius: 10, border: "none", background: tradeSide === "sell" ? C.red : C.surface2, color: tradeSide === "sell" ? "#2b0808" : C.inkDim, fontWeight: 700 }, children: "\u041F\u0440\u043E\u0434\u0430\u0442\u044C" })
        ] }),
        (BANK_ACCOUNTS.some((b) => bankAccounts[b.id]) || selectedCompany.sector === "\u041A\u0440\u0438\u043F\u0442\u043E" || greyAccount || Object.keys(muleCards).length > 0) && (() => {
          const options = [
            ...cash > 0 ? [{ id: "personal", label: `\u0424\u0438\u0437\u043B\u0438\u0446\u043E \xB7 \u043D\u0430\u043B\u0438\u0447\u043D\u044B\u0435` }] : [],
            ...BANK_ACCOUNTS.filter((b) => bankAccounts[b.id] && !bankAccounts[b.id].frozen).map((b) => ({ id: b.id, label: `${b.name} \xB7 \u043A\u0430\u0440\u0442\u0430` })),
            ...selectedCompany.sector === "\u041A\u0440\u0438\u043F\u0442\u043E" ? [{ id: "ip", label: "\u0418\u041F" }] : [],
            ...greyAccount && !greyAccount.frozen ? [{ id: "grey", label: `${GREY_BANK.name}` }] : [],
            ...Object.entries(muleCards).filter(([, c]) => !c.frozen).map(([mid, c]) => ({ id: mid, label: `${BANK_ACCOUNTS.find((b) => b.id === c.bankId)?.name} \xB7 \u0447\u0443\u0436\u0430\u044F \u043A\u0430\u0440\u0442\u0430` }))
          ];
          return /* @__PURE__ */ jsxs("div", { style: { marginBottom: 10 }, children: [
            /* @__PURE__ */ jsx("select", { value: tradeAccountResolved, onChange: (e) => {
              setTradeAccount(e.target.value);
              setTradeLeverage(1);
            }, style: { width: "100%", background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 10, color: C.ink, fontSize: 13, padding: "10px 10px" }, children: options.map((o) => /* @__PURE__ */ jsx("option", { value: o.id, children: o.label }, o.id)) }),
            /* @__PURE__ */ jsx("div", { style: { fontSize: 10.5, color: C.inkFaint, marginTop: 6, textAlign: "center" }, children: tradeIsGrey ? `\u041E\u0444\u0448\u043E\u0440\u043D\u044B\u0439 \u0441\u0447\u0451\u0442: \u043A\u043E\u043C\u0438\u0441\u0441\u0438\u044F \u043F\u043E\u043A\u0443\u043F\u043A\u0430 ${Math.round(GREY_BANK.tradeBuyFee * 100)}% / \u043F\u0440\u043E\u0434\u0430\u0436\u0430 ${Math.round(GREY_BANK.tradeSellFee * 100)}%, \u0431\u0435\u0437 \u043D\u0430\u043B\u043E\u0433\u043E\u0432\u043E\u0439 \u043E\u0442\u0447\u0451\u0442\u043D\u043E\u0441\u0442\u0438.` : tradeAccountResolved === "ip" ? "\u0414\u0435\u043D\u044C\u0433\u0438 \u0438 \u0430\u043A\u0442\u0438\u0432\u044B \u2014 \u043D\u0430 \u0441\u0447\u0451\u0442\u0435 \u0418\u041F. \u041F\u0440\u0438\u0431\u044B\u043B\u044C \u0431\u0435\u0437 \u043E\u0442\u0434\u0435\u043B\u044C\u043D\u043E\u0433\u043E \u043D\u0430\u043B\u043E\u0433\u0430, \u043D\u043E \u0438\u0434\u0451\u0442 \u0432 \u043E\u0431\u043E\u0440\u043E\u0442 \u0438 \u043E\u0431\u043B\u0430\u0433\u0430\u0435\u0442\u0441\u044F \u043A\u0432\u0430\u0440\u0442\u0430\u043B\u044C\u043D\u043E\u0439 \u0434\u0435\u043A\u043B\u0430\u0440\u0430\u0446\u0438\u0435\u0439." : tradeIsBankCard ? "\u041E\u043F\u043B\u0430\u0442\u0430 \u043A\u0430\u0440\u0442\u043E\u0439 \u044D\u0442\u043E\u0433\u043E \u0431\u0430\u043D\u043A\u0430 \u2014 \u0430\u043A\u0442\u0438\u0432\u044B \u043F\u043E\u043F\u0430\u0434\u0443\u0442 \u0432 \u0442\u0432\u043E\u0439 \u043E\u0431\u044B\u0447\u043D\u044B\u0439 \u043B\u0438\u0447\u043D\u044B\u0439 \u043F\u043E\u0440\u0442\u0444\u0435\u043B\u044C." : tradeIsMule ? "\u041E\u043F\u043B\u0430\u0442\u0430 \u0447\u0443\u0436\u043E\u0439 \u043A\u0430\u0440\u0442\u043E\u0439 \u2014 \u043F\u043E\u043A\u0443\u043F\u043A\u0430 \u043D\u0435 \u043F\u0440\u0438\u0432\u044F\u0437\u0430\u043D\u0430 \u043A \u0442\u0432\u043E\u0435\u0439 \u043B\u0438\u0447\u043D\u043E\u0441\u0442\u0438, \u0440\u0438\u0441\u043A\u0430 \u0434\u043B\u044F \u0440\u0435\u043F\u0443\u0442\u0430\u0446\u0438\u0438 \u043D\u0435\u0442." : "\u0414\u0435\u043D\u044C\u0433\u0438 \u0438 \u0430\u043A\u0442\u0438\u0432\u044B \u2014 \u043B\u0438\u0447\u043D\u044B\u0435. \u041F\u0440\u0438\u0431\u044B\u043B\u044C \u043E\u0431\u043B\u0430\u0433\u0430\u0435\u0442\u0441\u044F \u043D\u0430\u043B\u043E\u0433\u043E\u043C 13% \u043F\u0440\u0438 \u043F\u0440\u043E\u0434\u0430\u0436\u0435." })
          ] });
        })(),
        tradeSide === "buy" && !tradeIsIp && !tradeIsGrey && !tradeIsMule && /* @__PURE__ */ jsx("div", { style: { display: "flex", gap: 6, marginBottom: 10 }, children: [1, 5, 10, 20].map((lev) => /* @__PURE__ */ jsx("button", { onClick: () => setTradeLeverage(lev), style: { flex: 1, padding: "8px 0", borderRadius: 9, border: `1px solid ${tradeLeverage === lev ? C.gold : C.border}`, background: tradeLeverage === lev ? `${C.gold}22` : C.surface2, color: tradeLeverage === lev ? C.gold : C.inkDim, fontWeight: 700, fontSize: 12.5 }, children: lev === 1 ? "\u0411\u0435\u0437 \u043F\u043B\u0435\u0447\u0430" : `\xD7${lev}` }, lev)) }),
        /* @__PURE__ */ jsx("div", { style: { display: "flex", justifyContent: "flex-end", marginBottom: 6 }, children: /* @__PURE__ */ jsx("button", { onClick: () => {
          setTradeQtyMode((m) => m === "qty" ? "amount" : "qty");
          setTradeAmountInput("");
        }, style: { background: "none", border: "none", color: C.gold, fontSize: 11, padding: 0 }, children: tradeQtyMode === "qty" ? "\u0412\u0432\u0435\u0441\u0442\u0438 \u0441\u0443\u043C\u043C\u0443 \u0432 $" : "\u0412\u0432\u0435\u0441\u0442\u0438 \u043A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E" }) }),
        tradeQtyMode === "amount" ? /* @__PURE__ */ jsxs("div", { style: { background: C.surface2, borderRadius: 12, padding: 10, marginBottom: 10 }, children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              value: tradeAmountInput,
              onChange: (e) => {
                const v = e.target.value.replace(/[^0-9.]/g, "");
                setTradeAmountInput(v);
                const amt = Number(v) || 0;
                const price = selectedCompany.price || 1;
                setTradeQty(amt > 0 ? Math.max(1, Math.floor(amt / price)) : 0);
              },
              placeholder: "\u0421\u0443\u043C\u043C\u0430 \u0432 $",
              inputMode: "decimal",
              style: { width: "100%", textAlign: "center", background: "transparent", border: "none", color: C.ink, fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, outline: "none" }
            }
          ),
          /* @__PURE__ */ jsxs("div", { style: { textAlign: "center", fontSize: 11.5, color: C.inkDim, marginTop: 4 }, children: [
            "\u2248 ",
            tradeQty.toLocaleString(),
            " \u0448\u0442 \u043F\u043E ",
            fmt(selectedCompany.price)
          ] })
        ] }) : /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", background: C.surface2, borderRadius: 12, padding: 10, marginBottom: 10 }, children: [
          /* @__PURE__ */ jsx("button", { onClick: () => setTradeQty((q) => Math.max(1, (Number(q) || 0) - 1)), style: qtyBtnStyle, children: "\u2212" }),
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "baseline", gap: 6 }, children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                value: tradeQty === 0 ? "" : tradeQty,
                onChange: (e) => {
                  const v = e.target.value.replace(/[^0-9]/g, "");
                  setTradeQty(v === "" ? 0 : parseInt(v, 10));
                },
                onBlur: () => setTradeQty((q) => !q || q < 1 ? 1 : q),
                inputMode: "numeric",
                style: { width: 84, textAlign: "center", background: "transparent", border: "none", color: C.ink, fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700, outline: "none" }
              }
            ),
            /* @__PURE__ */ jsx("span", { style: { fontSize: 12, color: C.inkDim }, children: "\u0448\u0442" })
          ] }),
          /* @__PURE__ */ jsx("button", { onClick: () => setTradeQty((q) => (Number(q) || 0) + 1), style: qtyBtnStyle, children: "+" })
        ] }),
        tradeSide === "sell" && selectedHeld > 0 && /* @__PURE__ */ jsx("div", { style: { display: "flex", gap: 5, marginBottom: 12, flexWrap: "wrap" }, children: [10, 20, 40, 50, 70, 100].map((pct) => /* @__PURE__ */ jsxs("button", { onClick: () => setTradeQty(Math.max(1, Math.floor(selectedHeld * pct / 100))), style: pctBtnStyle, children: [
          pct,
          "%"
        ] }, pct)) }),
        tradeSide === "buy" && tradeLeverage > 1 && !tradeIsIp && !tradeIsGrey && !tradeIsMule ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("div", { style: { fontSize: 12, color: C.inkDim, marginBottom: 6, display: "flex", justifyContent: "space-between" }, children: [
            /* @__PURE__ */ jsxs("span", { children: [
              "\u041C\u0430\u0440\u0436\u0430 (\xD7",
              tradeLeverage,
              ")"
            ] }),
            /* @__PURE__ */ jsx("span", { style: { color: C.ink, fontFamily: "'JetBrains Mono', monospace" }, children: fmt(selectedCompany.price * tradeQty / tradeLeverage) })
          ] }),
          /* @__PURE__ */ jsxs("div", { style: { fontSize: 11, color: C.inkFaint, marginBottom: 10 }, children: [
            "\u041B\u0438\u043A\u0432\u0438\u0434\u0430\u0446\u0438\u044F \u043F\u0440\u0438 \u0446\u0435\u043D\u0435 \u2248 ",
            fmt(selectedCompany.price * (1 - 0.9 / tradeLeverage)),
            " \u2014 \u043C\u0430\u0440\u0436\u0430 \u0441\u0433\u043E\u0440\u0430\u0435\u0442 \u043F\u043E\u043B\u043D\u043E\u0441\u0442\u044C\u044E"
          ] })
        ] }) : /* @__PURE__ */ jsxs("div", { style: { fontSize: 12, color: C.inkDim, marginBottom: 6, display: "flex", justifyContent: "space-between" }, children: [
          /* @__PURE__ */ jsx("span", { children: tradeSide === "buy" ? "\u0421\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C" : "\u041F\u043E\u043B\u0443\u0447\u0438\u0448\u044C" }),
          /* @__PURE__ */ jsx("span", { style: { color: C.ink, fontFamily: "'JetBrains Mono', monospace" }, children: fmt(tradeSide === "buy" ? selectedCompany.price * tradeQty * (tradeIsGrey ? 1 + GREY_BANK.tradeBuyFee : 1) : selectedCompany.price * tradeQty * 0.998 * (tradeIsGrey ? 1 - GREY_BANK.tradeSellFee : 1)) })
        ] }),
        tradeSide === "sell" && !tradeIsIp && !tradeIsGrey && !tradeIsBankCard && !tradeIsMule && (selectedCompany.price - (holdings[selectedCompany.id]?.avgCost || 0)) * tradeQty > 0 && /* @__PURE__ */ jsxs("div", { style: { fontSize: 11, color: C.inkFaint, marginBottom: 10 }, children: [
          "\u041D\u0430\u0447\u0438\u0441\u043B\u0438\u0442\u0441\u044F \u043D\u0430\u043B\u043E\u0433 \u2248 ",
          fmt((selectedCompany.price - (holdings[selectedCompany.id]?.avgCost || 0)) * tradeQty * 0.13),
          " \u2014 \u043E\u043F\u043B\u0430\u0442\u0438\u0442\u044C \u043C\u043E\u0436\u043D\u043E \u0432 \xAB\u041A\u0430\u0431\u0438\u043D\u0435\u0442 \u2192 \u041D\u0430\u043B\u043E\u0433\u0438\xBB"
        ] }),
        tradeSide === "sell" && tradeIsIp && /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: C.inkFaint, marginBottom: 10 }, children: "\u0412\u044B\u0440\u0443\u0447\u043A\u0430 \u043F\u043E\u0439\u0434\u0451\u0442 \u0432 \u043E\u0431\u043E\u0440\u043E\u0442 \u0418\u041F \u2014 \u0443\u0447\u0442\u0451\u0442\u0441\u044F \u0432 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0439 \u043A\u0432\u0430\u0440\u0442\u0430\u043B\u044C\u043D\u043E\u0439 \u0434\u0435\u043A\u043B\u0430\u0440\u0430\u0446\u0438\u0438." }),
        tradeSide === "sell" && tradeIsGrey && /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: C.inkFaint, marginBottom: 10 }, children: "\u041E\u0444\u0448\u043E\u0440\u043D\u044B\u0439 \u0441\u0447\u0451\u0442 \u2014 \u0431\u0435\u0437 \u043D\u0430\u043B\u043E\u0433\u043E\u0432\u043E\u0439 \u043E\u0442\u0447\u0451\u0442\u043D\u043E\u0441\u0442\u0438, \u043D\u043E \u043A\u043E\u043C\u0438\u0441\u0441\u0438\u044F \u043F\u043B\u043E\u0449\u0430\u0434\u043A\u0438 \u0443\u0436\u0435 \u0432\u044B\u0447\u0442\u0435\u043D\u0430 \u0438\u0437 \u0441\u0443\u043C\u043C\u044B \u0432\u044B\u0448\u0435." }),
        tradeSide === "sell" && assetsFrozen && /* @__PURE__ */ jsx("div", { style: { background: `${C.red}18`, border: `1px solid ${C.red}55`, borderRadius: 10, padding: 10, marginBottom: 10, fontSize: 12, color: C.red, textAlign: "center" }, children: "\u0410\u043A\u0442\u0438\u0432\u044B \u043F\u043E\u0434 \u0430\u0440\u0435\u0441\u0442\u043E\u043C \u0431\u0430\u043D\u043A\u0430 \u0438\u0437-\u0437\u0430 \u0434\u043E\u043B\u0433\u0430 \u043F\u043E \u043A\u0440\u0435\u0434\u0438\u0442\u0443 \u2014 \u043F\u0440\u043E\u0434\u0430\u0436\u0430 \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u0430" }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => {
              if (tradeSide === "buy" && tradeLeverage > 1 && !tradeIsIp && !tradeIsGrey && !tradeIsMule) openLeveragedPosition(selectedCompany.id, tradeQty, tradeLeverage, tradeAccountResolved);
              else executeTrade(selectedCompany.id, tradeSide, tradeQty, tradeAccountResolved);
              setTradeQty(1);
            },
            disabled: tradeQty < 1 || tradeSide === "sell" && assetsFrozen || (tradeSide === "buy" ? tradeLeverage > 1 && !tradeIsIp && !tradeIsGrey && !tradeIsMule ? selectedCompany.price * tradeQty / tradeLeverage > tradeAvailableCash : tradeAvailableCash < selectedCompany.price * tradeQty * (tradeIsGrey ? 1 + GREY_BANK.tradeBuyFee : 1) : selectedHeld < tradeQty),
            style: { width: "100%", padding: 14, borderRadius: 12, border: "none", fontWeight: 700, background: tradeSide === "buy" ? C.green : C.red, color: "#0B0E14" },
            children: [
              tradeSide === "buy" ? tradeLeverage > 1 && !tradeIsIp && !tradeIsGrey && !tradeIsMule ? `\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u043F\u043E\u0437\u0438\u0446\u0438\u044E \xD7${tradeLeverage}` : "\u041A\u0443\u043F\u0438\u0442\u044C" : "\u041F\u0440\u043E\u0434\u0430\u0442\u044C",
              " ",
              selectedCompany.ticker
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { style: { fontSize: 11, color: C.inkFaint, marginTop: 10, textAlign: "center" }, children: [
          "\u0414\u043E\u0441\u0442\u0443\u043F\u043D\u043E",
          tradeIsGrey ? " \u043D\u0430 Meridian" : tradeIsIp ? " \u043D\u0430 \u0441\u0447\u0451\u0442\u0435 \u0418\u041F" : tradeIsBankCard ? ` \u043D\u0430 \u043A\u0430\u0440\u0442\u0435 ${BANK_ACCOUNTS.find((b) => b.id === tradeAccountResolved)?.name}` : tradeIsMule ? " \u043D\u0430 \u0447\u0443\u0436\u043E\u0439 \u043A\u0430\u0440\u0442\u0435" : "",
          ": ",
          fmt(tradeAvailableCash),
          tradeSide === "sell" ? ` \xB7 \u0412 \u043F\u043E\u0440\u0442\u0444\u0435\u043B\u0435: ${selectedHeld.toLocaleString()} \u0448\u0442` : ""
        ] })
      ] }) }),
      confirmCloseVenture && playerVenture && /* @__PURE__ */ jsx("div", { style: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60 }, children: /* @__PURE__ */ jsxs("div", { style: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, width: "85%", maxWidth: 320 }, children: [
        /* @__PURE__ */ jsxs("div", { style: { fontWeight: 700, fontSize: 16, marginBottom: 8 }, children: [
          "\u0417\u0430\u043A\u0440\u044B\u0442\u044C ",
          playerVenture.name,
          "?"
        ] }),
        /* @__PURE__ */ jsx("div", { style: { fontSize: 13, color: C.inkDim, marginBottom: 16 }, children: "\u041A\u043E\u043C\u043F\u0430\u043D\u0438\u044F/\u0442\u043E\u043A\u0435\u043D \u0438\u0441\u0447\u0435\u0437\u043D\u0435\u0442 \u0441 \u0440\u044B\u043D\u043A\u0430, \u0442\u0432\u043E\u0438 \u0430\u043A\u0446\u0438\u0438 \u0432 \u043D\u0435\u0439 \u0441\u043F\u0438\u0441\u044B\u0432\u0430\u044E\u0442\u0441\u044F \u0431\u0435\u0437 \u0432\u044B\u043F\u043B\u0430\u0442\u044B. \u041F\u043E\u0441\u043B\u0435 \u044D\u0442\u043E\u0433\u043E \u043C\u043E\u0436\u043D\u043E \u0437\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u044C \u043D\u043E\u0432\u044B\u0439 \u0431\u0438\u0437\u043D\u0435\u0441 \u0441 \u043D\u0443\u043B\u044F." }),
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8 }, children: [
          /* @__PURE__ */ jsx("button", { onClick: () => setConfirmCloseVenture(false), style: { flex: 1, padding: 12, borderRadius: 10, border: `1px solid ${C.border}`, background: "transparent", color: C.ink }, children: "\u041E\u0442\u043C\u0435\u043D\u0430" }),
          /* @__PURE__ */ jsx("button", { onClick: () => {
            closeVenture();
            setConfirmCloseVenture(false);
          }, style: { flex: 1, padding: 12, borderRadius: 10, border: "none", background: C.red, color: "#fff", fontWeight: 700 }, children: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C" })
        ] })
      ] }) }),
      confirmCloseResell && resellShops.find((s) => s.id === confirmCloseResell) && /* @__PURE__ */ jsx("div", { style: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60 }, children: /* @__PURE__ */ jsxs("div", { style: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, width: "85%", maxWidth: 320 }, children: [
        /* @__PURE__ */ jsxs("div", { style: { fontWeight: 700, fontSize: 16, marginBottom: 8 }, children: [
          "\u0417\u0430\u043A\u0440\u044B\u0442\u044C ",
          resellShops.find((s) => s.id === confirmCloseResell)?.name,
          "?"
        ] }),
        /* @__PURE__ */ jsxs("div", { style: { fontSize: 13, color: C.inkDim, marginBottom: 16 }, children: [
          Object.values(resellShops.find((s) => s.id === confirmCloseResell)?.categories || {}).some((c) => c.stock > 0) ? "\u041E\u0441\u0442\u0430\u0442\u043E\u043A \u0441\u043A\u043B\u0430\u0434\u0430 \u0440\u0430\u0441\u043F\u0440\u043E\u0434\u0430\u0451\u0442\u0441\u044F \u043E\u043F\u0442\u043E\u043C \u0437\u0430 50% \u0441\u0435\u0431\u0435\u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u0438 \u043D\u0430 \u0441\u0447\u0451\u0442 \u0418\u041F." : "\u0417\u0430\u043A\u0430\u0437\u044B \u0432 \u043F\u0443\u0442\u0438 \u043F\u043E\u0442\u0435\u0440\u044F\u044E\u0442\u0441\u044F.",
          " \u0414\u0440\u0443\u0433\u0438\u0435 \u0431\u0438\u0437\u043D\u0435\u0441\u044B \u044D\u0442\u043E \u043D\u0435 \u0437\u0430\u0442\u0440\u043E\u043D\u0435\u0442."
        ] }),
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8 }, children: [
          /* @__PURE__ */ jsx("button", { onClick: () => setConfirmCloseResell(null), style: { flex: 1, padding: 12, borderRadius: 10, border: `1px solid ${C.border}`, background: "transparent", color: C.ink }, children: "\u041E\u0442\u043C\u0435\u043D\u0430" }),
          /* @__PURE__ */ jsx("button", { onClick: () => closeResellShop(confirmCloseResell), style: { flex: 1, padding: 12, borderRadius: 10, border: "none", background: C.red, color: "#fff", fontWeight: 700 }, children: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C" })
        ] })
      ] }) }),
      confirmCloseOffline && resellShops.find((s) => s.id === confirmCloseOffline) && /* @__PURE__ */ jsx("div", { style: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60 }, children: /* @__PURE__ */ jsxs("div", { style: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, width: "85%", maxWidth: 320 }, children: [
        /* @__PURE__ */ jsx("div", { style: { fontWeight: 700, fontSize: 16, marginBottom: 8 }, children: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u043E\u0444\u043B\u0430\u0439\u043D-\u043C\u0430\u0433\u0430\u0437\u0438\u043D?" }),
        /* @__PURE__ */ jsx("div", { style: { fontSize: 13, color: C.inkDim, marginBottom: 16 }, children: "\u0410\u0440\u0435\u043D\u0434\u0430 \u0438 \u0437\u0430\u0440\u043F\u043B\u0430\u0442\u0430 \u043F\u0435\u0440\u0435\u0441\u0442\u0430\u043D\u0443\u0442 \u0441\u043F\u0438\u0441\u044B\u0432\u0430\u0442\u044C\u0441\u044F, \u043D\u043E \u0432\u043B\u043E\u0436\u0435\u043D\u0438\u044F \u0432 \u043E\u0442\u043A\u0440\u044B\u0442\u0438\u0435 \u043D\u0435 \u0432\u0435\u0440\u043D\u0443\u0442\u0441\u044F. \u0422\u043E\u0432\u0430\u0440 \u043D\u0430 \u0441\u043A\u043B\u0430\u0434\u0435 \u043E\u0441\u0442\u0430\u043D\u0435\u0442\u0441\u044F \u2014 \u043C\u043E\u0436\u043D\u043E \u043F\u0440\u043E\u0434\u043E\u043B\u0436\u0430\u0442\u044C \u043F\u0440\u043E\u0434\u0430\u0432\u0430\u0442\u044C \u043E\u043D\u043B\u0430\u0439\u043D." }),
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8 }, children: [
          /* @__PURE__ */ jsx("button", { onClick: () => setConfirmCloseOffline(null), style: { flex: 1, padding: 12, borderRadius: 10, border: `1px solid ${C.border}`, background: "transparent", color: C.ink }, children: "\u041E\u0442\u043C\u0435\u043D\u0430" }),
          /* @__PURE__ */ jsx("button", { onClick: () => {
            closeOfflineStore(confirmCloseOffline);
            setConfirmCloseOffline(null);
          }, style: { flex: 1, padding: 12, borderRadius: 10, border: "none", background: C.red, color: "#fff", fontWeight: 700 }, children: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C" })
        ] })
      ] }) }),
      confirmReset && /* @__PURE__ */ jsx("div", { style: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60 }, children: /* @__PURE__ */ jsxs("div", { style: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, width: "85%", maxWidth: 320 }, children: [
        /* @__PURE__ */ jsx("div", { style: { fontWeight: 700, fontSize: 16, marginBottom: 8 }, children: "\u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C \u043F\u0440\u043E\u0433\u0440\u0435\u0441\u0441?" }),
        /* @__PURE__ */ jsx("div", { style: { fontSize: 13, color: C.inkDim, marginBottom: 16 }, children: "\u041A\u044D\u0448, \u043F\u043E\u0440\u0442\u0444\u0435\u043B\u044C, \u0440\u0430\u0431\u043E\u0442\u0430, \u043A\u0440\u0435\u0434\u0438\u0442\u044B, \u043D\u0430\u043B\u043E\u0433\u0438 \u0438 \u0431\u0438\u0437\u043D\u0435\u0441 \u0431\u0443\u0434\u0443\u0442 \u0443\u0434\u0430\u043B\u0435\u043D\u044B \u0431\u0435\u0437\u0432\u043E\u0437\u0432\u0440\u0430\u0442\u043D\u043E." }),
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8 }, children: [
          /* @__PURE__ */ jsx("button", { onClick: () => setConfirmReset(false), style: { flex: 1, padding: 12, borderRadius: 10, border: `1px solid ${C.border}`, background: "transparent", color: C.ink }, children: "\u041E\u0442\u043C\u0435\u043D\u0430" }),
          /* @__PURE__ */ jsx("button", { onClick: resetGame, style: { flex: 1, padding: 12, borderRadius: 10, border: "none", background: C.red, color: "#fff", fontWeight: 700 }, children: "\u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C" })
        ] })
      ] }) }),
      showBackupModal && /* @__PURE__ */ jsx("div", { style: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60, padding: 20 }, children: /* @__PURE__ */ jsxs("div", { style: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, width: "100%", maxWidth: 360, maxHeight: "85vh", overflowY: "auto" }, children: [
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }, children: [
          /* @__PURE__ */ jsx("div", { style: { fontWeight: 700, fontSize: 16 }, children: "\u0420\u0435\u0437\u0435\u0440\u0432\u043D\u0430\u044F \u043A\u043E\u043F\u0438\u044F" }),
          /* @__PURE__ */ jsx("button", { onClick: () => setShowBackupModal(false), style: { background: "none", border: "none", color: C.inkDim }, children: /* @__PURE__ */ jsx(X, { size: 18 }) })
        ] }),
        /* @__PURE__ */ jsx("div", { style: { fontSize: 11.5, color: C.inkDim, marginBottom: 10, lineHeight: 1.5 }, children: "\u0421\u043E\u0445\u0440\u0430\u043D\u0438 \u043F\u0440\u043E\u0433\u0440\u0435\u0441\u0441 \u0442\u0435\u043A\u0441\u0442\u043E\u043C \u2014 \u0441\u043A\u043E\u043F\u0438\u0440\u0443\u0439 \u0435\u0433\u043E \u043A\u0443\u0434\u0430 \u0443\u0433\u043E\u0434\u043D\u043E (\u0437\u0430\u043C\u0435\u0442\u043A\u0438, \u0447\u0430\u0442), \u0430 \u043F\u043E\u0442\u043E\u043C \u0432\u0441\u0442\u0430\u0432\u044C \u043E\u0431\u0440\u0430\u0442\u043D\u043E, \u0447\u0442\u043E\u0431\u044B \u043F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u0442\u044C \u0441 \u0442\u043E\u0433\u043E \u0436\u0435 \u043C\u0435\u0441\u0442\u0430." }),
        /* @__PURE__ */ jsx("button", { onClick: generateExportText, style: { width: "100%", padding: 10, borderRadius: 10, border: "none", fontWeight: 700, fontSize: 12.5, background: C.gold, color: "#161207", marginBottom: exportText ? 8 : 0 }, children: "\u0421\u0444\u043E\u0440\u043C\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u0435" }),
        exportText && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(
            "textarea",
            {
              readOnly: true,
              value: exportText,
              onFocus: (e) => e.target.select(),
              style: { width: "100%", height: 80, background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 10, padding: 8, color: C.inkDim, fontSize: 10, fontFamily: "'JetBrains Mono', monospace", resize: "none", marginBottom: 8 }
            }
          ),
          /* @__PURE__ */ jsxs("button", { onClick: copyExportText, style: { width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: 10, borderRadius: 10, border: `1px solid ${C.border}`, background: exportFlash ? `${C.green}22` : "transparent", color: exportFlash ? C.green : C.ink, fontWeight: 600, fontSize: 12.5 }, children: [
            exportFlash ? /* @__PURE__ */ jsx(Check, { size: 14 }) : null,
            " ",
            exportFlash ? "\u0421\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u043E" : "\u0421\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0442\u0435\u043A\u0441\u0442"
          ] }),
          /* @__PURE__ */ jsx("div", { style: { fontSize: 10.5, color: C.inkFaint, marginTop: 6 }, children: "\u0415\u0441\u043B\u0438 \u043A\u043D\u043E\u043F\u043A\u0430 \u043D\u0435 \u0441\u0440\u0430\u0431\u043E\u0442\u0430\u043B\u0430 \u2014 \u0437\u0430\u0436\u043C\u0438 \u0442\u0435\u043A\u0441\u0442 \u0432\u044B\u0448\u0435 \u0438 \u0441\u043A\u043E\u043F\u0438\u0440\u0443\u0439 \u0432\u0440\u0443\u0447\u043D\u0443\u044E." })
        ] }),
        /* @__PURE__ */ jsx("div", { style: { height: 1, background: C.border, margin: "14px 0" } }),
        /* @__PURE__ */ jsx("div", { style: { fontSize: 12.5, fontWeight: 600, marginBottom: 6 }, children: "\u0412\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C \u0438\u0437 \u0442\u0435\u043A\u0441\u0442\u0430" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            value: importText,
            onChange: (e) => setImportText(e.target.value),
            placeholder: "\u0412\u0441\u0442\u0430\u0432\u044C \u0441\u044E\u0434\u0430 \u0441\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0439 \u0442\u0435\u043A\u0441\u0442 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u044F\u2026",
            style: { width: "100%", height: 80, background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 10, padding: 8, color: C.ink, fontSize: 10, fontFamily: "'JetBrains Mono', monospace", resize: "none", marginBottom: 8 }
          }
        ),
        /* @__PURE__ */ jsx("button", { onClick: importFromText, disabled: !importText.trim(), style: { width: "100%", padding: 10, borderRadius: 10, border: "none", fontWeight: 700, fontSize: 12.5, background: importText.trim() ? C.green : C.surface2, color: importText.trim() ? "#06210f" : C.inkFaint }, children: "\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C" }),
        importError && /* @__PURE__ */ jsx("div", { style: { fontSize: 11.5, color: C.red, marginTop: 8 }, children: importError })
      ] }) })
    ] }) })
  ] });
}
var rootEl = document.getElementById("root");
createRoot(rootEl).render(/* @__PURE__ */ jsx(MarketSandbox, {}));
export {
  MarketSandbox as default
};
