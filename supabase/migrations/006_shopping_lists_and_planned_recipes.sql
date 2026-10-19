-- TICK-028: Shopping lists, items, and planned recipes tables

-- 1. Listes de courses
CREATE TABLE shopping_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Mes Courses de la Semaine',
  status TEXT CHECK (status IN ('active', 'completed', 'archived')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Articles de courses
CREATE TABLE shopping_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID REFERENCES shopping_lists(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  quantity NUMERIC(6,2),
  unit TEXT,
  aisle TEXT NOT NULL DEFAULT 'Épicerie',
  is_pantry_staple BOOLEAN DEFAULT false,
  is_checked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. Plats planifiés issus des recettes
CREATE TABLE planned_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  servings INT DEFAULT 2,
  calories INT,
  protein INT,
  carbs INT,
  fat INT,
  is_cooked BOOLEAN DEFAULT false,
  planned_date DATE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- RLS
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE planned_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own shopping lists" ON shopping_lists FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own shopping items" ON shopping_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own planned recipes" ON planned_recipes FOR ALL USING (auth.uid() = user_id);
