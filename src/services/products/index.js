const { ApolloServer, gql } = require("apollo-server");
const { buildFederatedSchema } = require("@apollo/federation");

const typeDefs = gql`
  interface Node {
    id: ID!
  }

  type Query {
    topProducts(first: Int = 5): [Product]
    node(id: ID!): Node
  }

  type Product implements Node @key(fields: "upc id") {
    id: ID!
    upc: String!
    name: String
    price: Int
    weight: Int
  }
`;

const resolvers = {
  Product: {
    __resolveReference(object) {
      return products.find(product => product.upc === object.upc || product.id === object.id);
    }
  },
  Query: {
    topProducts(_, args) {
      return products.slice(0, args.first);
    }
  }
};

const server = new ApolloServer({
  schema: buildFederatedSchema([
    {
      typeDefs,
      resolvers
    }
  ])
});

server.listen({ port: 4003 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});

const products = [
  {
    id: "Product:1",
    upc: "1",
    name: "Table",
    price: 899,
    weight: 100
  },
  {
    id: "Product:1",
    upc: "2",
    name: "Couch",
    price: 1299,
    weight: 1000
  },
  {
    id: "Product:1",
    upc: "3",
    name: "Chair",
    price: 54,
    weight: 50
  }
];
