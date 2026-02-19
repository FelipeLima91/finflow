import {
  Utensils,
  Repeat,
  Beer,
  Home,
  GraduationCap,
  TrendingUp,
  Gamepad2,
  ShoppingBasket,
  HeartPulse,
  Car,
  Shirt,
  Plane,
  Scissors,
  MoreHorizontal,
  Landmark,
} from "lucide-react";
import React from "react";

export const CATEGORY_ICONS: { [key: string]: React.ReactNode } = {
  Alimentação: <Utensils className="h-4 w-4" />,
  Assinaturas: <Repeat className="h-4 w-4" />,
  "Bares e Restaurantes": <Beer className="h-4 w-4" />,
  Casa: <Home className="h-4 w-4" />,
  Educação: <GraduationCap className="h-4 w-4" />,
  Investimento: <TrendingUp className="h-4 w-4" />,
  Lazer: <Gamepad2 className="h-4 w-4" />,
  Mercado: <ShoppingBasket className="h-4 w-4" />,
  Saúde: <HeartPulse className="h-4 w-4" />,
  Transporte: <Car className="h-4 w-4" />,
  Vestuário: <Shirt className="h-4 w-4" />,
  Viagem: <Plane className="h-4 w-4" />,
  Beleza: <Scissors className="h-4 w-4" />,
  Outros: <MoreHorizontal className="h-4 w-4" />,
  Banco: <Landmark className="h-4 w-4" />,
};

export const TRANSACTION_CATEGORIES = Object.keys(CATEGORY_ICONS).sort();
