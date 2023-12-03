create extension if not exists "uuid-ossp";

create table products (
	id uuid not null default uuid_generate_v4() primary key,
	title text not null,
	description text not null,
	price integer not null
);

create table stocks (
	product_id uuid not null primary key references products(id) on delete cascade,
	count integer not null
);