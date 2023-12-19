insert into products (title, description, price)
values
  ('The Pallbearer', 'Comedy', 72),
  ('Nightcrawler', 'Crime|Drama|Thriller', 99),
  ('Frankenstein''s Army', 'Action|Horror|Sci-Fi', 1),
  ('Johnny Suede', 'Comedy|Musical|Romance', 69),
  ('The Main Event', 'Comedy', 77),
  ('Around the Bend', 'Drama', 18),
  ('A Hole in My Heart', 'Drama', 10),
  ('The Inbetweeners Movie', 'Adventure|Comedy', 64),
  ('The Toast of New York', 'Comedy|Drama|War', 21),
  ('Road House', 'Drama|Film-Noir', 94);

insert into stocks (product_id, count)
select p.id, s.count
from (
  values
  ('The Pallbearer', 1),
  ('Nightcrawler', 2),
  ('Frankenstein''s Army', 3),
  ('Johnny Suede', 4),
  ('The Main Event', 5),
  ('Around the Bend', 6),
  ('A Hole in My Heart', 7),
  ('The Inbetweeners Movie', 8),
  ('The Toast of New York', 9),
  ('Road House', 10)
) as s(title, count)
join products p on p.title = s.title;