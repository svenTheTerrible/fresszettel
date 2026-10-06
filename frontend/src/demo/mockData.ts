import type { Invitation, Order, Restaurant } from '../types';

/** Sample data for the demo only. Replace with calls to your backend. */
export const mockRestaurants: Restaurant[] = [
  {
    id: 'r1',
    name: 'Pizzeria Da Mario',
    phone: '',
    menu: [
      { id: 'm7', number: '7', name: 'Bruschetta', description: 'Tomate, Knoblauch, Basilikum', priceCents: 550 },
      { id: 'm12', number: '12', name: 'Pizza Margherita', description: 'Tomate, Mozzarella, Basilikum', priceCents: 850 },
      { id: 'm14', number: '14', name: 'Pizza Funghi', description: 'Champignons, Mozzarella', priceCents: 950 },
      { id: 'm17', number: '17', name: 'Pizza Diavola', description: 'scharfe Salami, Peperoni', priceCents: 1050 },
      { id: 'm23', number: '23', name: 'Penne Arrabbiata', description: 'scharfe Tomatensauce', priceCents: 900 },
      { id: 'm28', number: '28', name: 'Lasagne', description: 'hausgemacht, mit Bolognese', priceCents: 1100 },
      { id: 'm41', number: '41', name: 'Tiramisu', description: 'im Glas', priceCents: 450 },
      { id: 'm52', number: '52', name: 'Cola 0,33 l', description: 'gekühlt', priceCents: 250 },
    ],
  },
  { id: 'r2', name: 'Asia Wok Express', menu: [] },
  { id: 'r3', name: 'Burger Bude', menu: [] },
];

const inMinutes = (min: number) => new Date(Date.now() + min * 60_000).toISOString();

export const mockInvitations: Invitation[] = [
  {
    id: 'i1',
    url: `${location.origin}${location.pathname}#/z/7Kq2xM`,
    restaurantId: 'r1',
    restaurantName: 'Pizzeria Da Mario',
    validFrom: inMinutes(-30),
    validUntil: inMinutes(47),
  },
];

export const mockOrders: Order[] = [
  { id: 'o1', invitationId: 'i1', name: 'Anna', paid: true, lines: [{ menuItemId: 'm12', quantity: 1 }, { menuItemId: 'm52', quantity: 1 }] },
  { id: 'o2', invitationId: 'i1', name: 'Ben', lines: [{ menuItemId: 'm17', quantity: 1 }] },
  { id: 'o3', invitationId: 'i1', name: 'Chiara', lines: [{ menuItemId: 'm23', quantity: 1 }, { menuItemId: 'm41', quantity: 1 }] },
  { id: 'o4', invitationId: 'i1', name: 'Deniz', paid: true, lines: [{ menuItemId: 'm12', quantity: 2 }] },
  { id: 'o5', invitationId: 'i1', name: 'Elena', lines: [{ menuItemId: 'm28', quantity: 1 }, { menuItemId: 'm52', quantity: 1 }] },
  { id: 'o6', invitationId: 'i1', name: 'Felix', lines: [{ menuItemId: 'm14', quantity: 1 }, { menuItemId: 'm7', quantity: 1 }] },
];
