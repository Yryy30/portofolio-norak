INSERT INTO site_content (key, value, type, group_name, label, sort_order) VALUES
  -- Global
  ('welcome_marquee', '👾 Welcome!, Welcome! 👾', 'text', 'global', 'Marquee atas', 1),

  -- Home
  ('home_name',   'My Name', 'text', 'home', 'Name', 1),
  ('home_role',   'Web Developer', 'text', 'home', 'Role / tagline', 2),
  ('home_status', 'Open to work', 'text', 'home', 'Status badge (empty to hide)', 3),
  ('home_intro',  'Welcome to my portfolio.', 'textarea', 'home', 'Intro', 4),
  ('home_image',  'https://media.giphy.com/media/ICOgUNjpvO0PC/giphy.gif', 'url', 'home', 'Foto / avatar / GIF', 5),

  -- Contact
  ('contact_intro', 'Contact me through one of the links below!', 'textarea', 'contact', 'Contact Intro', 1);

INSERT INTO skills (name, level, sort_order) VALUES
  ('Svelte', 80, 1),
  ('TypeScript', 70, 2),
  ('HTML / CSS', 90, 3),
  ('Cloudflare Workers', 60, 4);

INSERT INTO contact_links (label, value, url, icon, sort_order) VALUES
  ('Email',  'retro@portfolio.com',  'mailto:retro@portfolio.com',   '📧', 1),
  ('GitHub', 'github.com/xxx', 'https://github.com/xxx', '💾', 2);

INSERT INTO projects (slug, title, description, tech, sort_order) VALUES
  ('project-1', 'My Project 1', 'Project 1 description goes here.', '["HTML","CSS"]', 1),
  ('project-2', 'My Project 2', 'Project 2 description goes here.', '["PHP","MySQL"]', 2),
  ('project-3', 'My Project 3', 'Project 3 description goes here.', '["JavaScript"]', 3);
