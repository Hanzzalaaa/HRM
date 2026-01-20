-- Seed initial data for the HRM system

-- Insert departments
INSERT INTO departments (id, name, description, budget) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'Engineering', 'Software development and engineering team', 5000000),
  ('d1000000-0000-0000-0000-000000000002', 'Human Resources', 'HR and talent management', 1500000),
  ('d1000000-0000-0000-0000-000000000003', 'Finance', 'Financial operations and accounting', 2000000),
  ('d1000000-0000-0000-0000-000000000004', 'Marketing', 'Marketing and brand management', 3000000),
  ('d1000000-0000-0000-0000-000000000005', 'Sales', 'Sales and business development', 4000000),
  ('d1000000-0000-0000-0000-000000000006', 'Operations', 'Business operations and support', 2500000)
ON CONFLICT (name) DO NOTHING;

-- Insert company financials for last 6 months
INSERT INTO company_financials (month, year, total_revenue, total_expenses, salary_expenses, operational_expenses, profit_loss, pending_salaries, pending_salary_count, debt) VALUES
  (7, 2025, 12500000, 8500000, 5000000, 3500000, 4000000, 0, 0, 500000),
  (8, 2025, 13200000, 9100000, 5200000, 3900000, 4100000, 0, 0, 450000),
  (9, 2025, 14100000, 9500000, 5400000, 4100000, 4600000, 0, 0, 400000),
  (10, 2025, 13800000, 9200000, 5300000, 3900000, 4600000, 0, 0, 350000),
  (11, 2025, 15200000, 10100000, 5600000, 4500000, 5100000, 0, 0, 300000),
  (12, 2025, 16500000, 10800000, 5800000, 5000000, 5700000, 520000, 8, 250000)
ON CONFLICT (month, year) DO NOTHING;
