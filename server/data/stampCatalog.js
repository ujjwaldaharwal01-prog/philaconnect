// SERVER-SIDE PRICE LIST (sample data).
//
// The server never trusts prices sent by the browser: when an order is placed, it looks up each
// stamp here and uses THIS price. Keep it in step with client/src/data/stamps.js.
// LATER (admin dashboard step): this file is replaced by a 'stamps' table in PostgreSQL.
module.exports = [
  {
    "id": "st-001",
    "name": "Emerald Kingfisher",
    "country": "India",
    "year": 1976,
    "condition": "Mint",
    "price": 1850
  },
  {
    "id": "st-002",
    "name": "Hill Fort at Dawn",
    "country": "India",
    "year": 1962,
    "condition": "Fine Used",
    "price": 640
  },
  {
    "id": "st-003",
    "name": "Lotus Blossom Definitive",
    "country": "India",
    "year": 1958,
    "condition": "Mint Hinged",
    "price": 920
  },
  {
    "id": "st-004",
    "name": "Steam Express Centenary",
    "country": "United Kingdom",
    "year": 1975,
    "condition": "Very Fine",
    "price": 2400
  },
  {
    "id": "st-005",
    "name": "Clipper Ship Regatta",
    "country": "Portugal",
    "year": 1968,
    "condition": "Used",
    "price": 780
  },
  {
    "id": "st-006",
    "name": "Moon Orbit Commemorative",
    "country": "United States",
    "year": 1969,
    "condition": "Mint",
    "price": 3150
  },
  {
    "id": "st-007",
    "name": "Heron of the Wetlands",
    "country": "Sri Lanka",
    "year": 1983,
    "condition": "Mint",
    "price": 1180
  },
  {
    "id": "st-008",
    "name": "Colonnade Dome Heritage",
    "country": "Turkey",
    "year": 1971,
    "condition": "Very Fine",
    "price": 1560
  },
  {
    "id": "st-009",
    "name": "Peacock Pavilion",
    "country": "India",
    "year": 1974,
    "condition": "Mint Hinged",
    "price": 1390
  },
  {
    "id": "st-010",
    "name": "Monsoon Lily",
    "country": "Sri Lanka",
    "year": 1966,
    "condition": "Used",
    "price": 450
  },
  {
    "id": "st-011",
    "name": "Harbour Lights Schooner",
    "country": "United Kingdom",
    "year": 1972,
    "condition": "Very Fine",
    "price": 1980
  },
  {
    "id": "st-012",
    "name": "Night Rocket Launch",
    "country": "United States",
    "year": 1962,
    "condition": "Mint Hinged",
    "price": 2750
  },
  {
    "id": "st-013",
    "name": "Mountain Railway Jubilee",
    "country": "Switzerland",
    "year": 1982,
    "condition": "Mint",
    "price": 2100
  },
  {
    "id": "st-014",
    "name": "Minaret Skyline",
    "country": "Turkey",
    "year": 1959,
    "condition": "Fine Used",
    "price": 540
  },
  {
    "id": "st-015",
    "name": "Wild Orchid Study",
    "country": "Singapore",
    "year": 1979,
    "condition": "Mint",
    "price": 1260
  },
  {
    "id": "st-016",
    "name": "Crane at Sunrise",
    "country": "Japan",
    "year": 1968,
    "condition": "Very Fine",
    "price": 1720
  },
  {
    "id": "st-017",
    "name": "Satellite Pioneer",
    "country": "USSR",
    "year": 1965,
    "condition": "Fine Used",
    "price": 880
  },
  {
    "id": "st-018",
    "name": "Coastal Freighter",
    "country": "Netherlands",
    "year": 1957,
    "condition": "Used",
    "price": 390
  },
  {
    "id": "st-019",
    "name": "Cathedral Dome",
    "country": "Italy",
    "year": 1961,
    "condition": "Mint",
    "price": 1640
  },
  {
    "id": "st-020",
    "name": "Mail Train Express",
    "country": "India",
    "year": 1980,
    "condition": "Fine Used",
    "price": 720
  },
  {
    "id": "st-021",
    "name": "Sunbird in Bloom",
    "country": "Kenya",
    "year": 1977,
    "condition": "Mint Hinged",
    "price": 980
  },
  {
    "id": "st-022",
    "name": "Lunar Landing Anniversary",
    "country": "Canada",
    "year": 1989,
    "condition": "Mint",
    "price": 1450
  },
  {
    "id": "st-023",
    "name": "Rose Garden Definitive",
    "country": "United Kingdom",
    "year": 1964,
    "condition": "Very Fine",
    "price": 1120
  },
  {
    "id": "st-024",
    "name": "Spice Route Galleon",
    "country": "Portugal",
    "year": 1980,
    "condition": "Mint",
    "price": 1340
  }
];
