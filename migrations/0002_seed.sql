INSERT INTO site_content (key, value, type, group_name, label, sort_order) VALUES
  -- Global
  ('welcome_marquee', '👾 Welcome!, Welcome! 👾', 'text', 'global', 'Marquee atas', 1),

  -- Home
  ('home_name',   'Yry', 'text', 'home', 'Name', 1),
  ('home_role',   'Web Developer', 'text', 'home', 'Role / tagline', 2),
  ('home_status', 'Open to work', 'text', 'home', 'Badge status (empty to hide)', 3),
  ('home_intro',  'Hello World! Welcome to my portfolio.', 'textarea', 'home', 'Intro', 4),
  ('home_image',  'https://media.giphy.com/media/ICOgUNjpvO0PC/giphy.gif', 'url', 'home', 'Photo / avatar / GIF', 5),

  -- Contact
  ('contact_intro', 'Contact me!', 'textarea', 'contact', 'Intro', 1);

INSERT INTO skills (name, level, sort_order) VALUES
  ('Svelte', 80, 1),
  ('TypeScript', 70, 2),
  ('HTML / CSS', 90, 3),
  ('Cloudflare Workers', 60, 4);

INSERT INTO contact_links (label, value, url, icon, sort_order) VALUES
  ('Email',     'retro@portfolio.com',   'mailto:retro@portfolio.com',    '📧', 1),
  ('WhatsApp',  '+62 812-0000-0000',     'https://wa.me/6281200000000',   '📞', 2),
  ('GitHub',    'github.com/xxx',        'https://github.com/xxx',        '💾', 3),
  ('Instagram', '@username',             'https://instagram.com/username','📷', 4);

INSERT INTO projects
  (slug, title, summary, description, tech, features, role, year, status, url, repo_url, featured, sort_order)
VALUES
  ('project-1',
   'Project 1',
   'Project 1 Summary.',
   'Project 1 Description.',
   '["HTML","CSS","JavaScript"]',
   '["Feature 1","Feature 2","Feature 3"]',
   'Full-stack Developer', 2025, 'completed',
   NULL, 'https://github.com/xxx/project-1', 1, 1),

  ('project-2',
   'Project 2',
   'Project 2 Summary.',
   'Project 2 Description.',
   '["PHP","MySQL"]',
   '["Feature 1","Feature 2","Feature 3"]',
   'Developer', 2025, 'completed',
   NULL, 'https://github.com/xxx/project-2', 1, 2),

  ('project-3',
   'Project 3',
   'Project 3 Summary.',
   'Project 3 Description.',
   '["JavaScript","Cloudflare Workers"]',
   '["Feature 1","Feature 2","Feature 3"]',
   'Developer', 2026, 'in-progress',
   NULL, NULL, 1, 3);
