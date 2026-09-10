const keys = {
  products: {
    all: ["products"],
    list: (filters) => ["products", "list", filters],
    availability: (slug) => ["products", "availability", slug],
  },
  stock: {
    all: ["stock"],
    forSlugs: (slugs) => ["stock", [...slugs].sort()],
  },
  reviews: {
    all: ["reviews"],
    list: () => ["reviews", "list"],
  },
  payments: {
    methods: () => ["payments", "methods"],
  },
  wishlist: {
    all: ["wishlist"],
  },
  admin: {
    all: ["admin"],
    products: (query) => ["admin", "products", query],
    orders: (query) => ["admin", "orders", query],
    promos: () => ["admin", "promos"],
    reviews: (status) => ["admin", "reviews", status],
  },
};

export default keys;
