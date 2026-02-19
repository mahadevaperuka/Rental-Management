import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

const httpLink = createHttpLink({
    uri: `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/graphql`,
    credentials: 'include', // IMPORTANT: Send cookies with requests for better-auth
});

export const client = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
});
