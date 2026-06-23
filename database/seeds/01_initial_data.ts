import type { Knex } from 'knex';
import bcrypt from 'bcrypt';

export async function seed(knex: Knex): Promise<void> {
  // 기존 데이터 정리 (순서: FK 종속성 역순)
  await knex('order_items').del();
  await knex('orders').del();
  await knex('order_history').del();
  await knex('table_sessions').del();
  await knex('menus').del();
  await knex('users').del();

  // 관리자 계정 (storeId: store001, username: admin, password: admin1234)
  const hashedPassword = await bcrypt.hash('admin1234', 10);
  await knex('users').insert({
    store_id: 'store001',
    username: 'admin',
    hashed_password: hashedPassword,
    failed_attempts: 0,
  });

  // 샘플 메뉴
  await knex('menus').insert([
    {
      name: '아메리카노',
      price: 4500,
      category: '커피',
      description: '진한 에스프레소와 물의 조화',
      image_url: 'https://placehold.co/300x200?text=Americano',
      display_order: 1,
      is_active: true,
    },
    {
      name: '카페라떼',
      price: 5000,
      category: '커피',
      description: '부드러운 우유와 에스프레소',
      image_url: 'https://placehold.co/300x200?text=Latte',
      display_order: 2,
      is_active: true,
    },
    {
      name: '딸기 스무디',
      price: 6000,
      category: '음료',
      description: '신선한 딸기로 만든 스무디',
      image_url: 'https://placehold.co/300x200?text=Smoothie',
      display_order: 1,
      is_active: true,
    },
    {
      name: '치즈케이크',
      price: 6500,
      category: '디저트',
      description: '진한 뉴욕 스타일 치즈케이크',
      image_url: 'https://placehold.co/300x200?text=Cheesecake',
      display_order: 1,
      is_active: true,
    },
    {
      name: '크로플',
      price: 5500,
      category: '디저트',
      description: '바삭한 크로플',
      image_url: 'https://placehold.co/300x200?text=Croffle',
      display_order: 2,
      is_active: true,
    },
  ]);
}
