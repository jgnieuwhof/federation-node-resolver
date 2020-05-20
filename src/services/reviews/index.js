const { ApolloServer, gql } = require("apollo-server");
const { buildFederatedSchema } = require("@apollo/federation");

const typeDefs = gql`
  interface Node {
    id: ID!
  }

  type Query {
    node(id: ID!): Node
  }

  type Review implements Node @key(fields: "id") {
    id: ID!
    body: String
    author: User @provides(fields: "username")
    product: Product
  }

  extend type User @key(fields: "id") {
    id: ID! @external
    username: String @external
    reviews: [Review]
  }

  extend type Product @key(fields: "upc") {
    upc: String! @external
    reviews: [Review]
  }
`;

const resolvers = {
  Review: {
    __resolveReference(object) {
      return reviews.find(review => review.id === object.id);
    },
    author(review) {
      return { __typename: "User", id: review.authorID };
    }
  },
  User: {
    reviews(user) {
      return reviews.filter(review => review.authorID === user.id);
    },
    numberOfReviews(user) {
      return reviews.filter(review => review.authorID === user.id).length;
    },
    username(user) {
      const found = usernames.find(username => username.id === user.id);
      return found ? found.username : null;
    }
  },
  Product: {
    reviews(product) {
      return reviews.filter(review => review.product.upc === product.upc);
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

server.listen({ port: 4002 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});

const usernames = [
  { id: "User:1", username: "@ada" },
  { id: "User:2", username: "@complete" }
];
const reviews = [
  {
    id: "Review:1",
    authorID: "User:1",
    product: { upc: "1" },
    body: "Love it!"
  },
  {
    id: "Review:2",
    authorID: "User:1",
    product: { upc: "2" },
    body: "Too expensive."
  },
  {
    id: "Review:3",
    authorID: "User:2",
    product: { upc: "3" },
    body: "Could be better."
  },
  {
    id: "Review:4",
    authorID: "User:2",
    product: { upc: "1" },
    body: "Prefer something else."
  }
];
