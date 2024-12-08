// app/utils/seed.server.ts
import driver from '~/db/neo4j.server';

export async function initializeDatabase() {
  const session = driver.session();
  try {
    // Delete existing data (development only)
    if (process.env.NODE_ENV === 'development') {
      await session.run('MATCH (n) DETACH DELETE n');
    }

    // Create constraints and indexes
    await session.run('CREATE CONSTRAINT unique_post_id IF NOT EXISTS ON (p:Post) ASSERT p.id IS UNIQUE');
    await session.run('CREATE CONSTRAINT unique_author_id IF NOT EXISTS ON (a:Author) ASSERT a.id IS UNIQUE');
    // Add more constraints as needed

    // Seed authors
    const authors = [
      { id: 1, name: 'Author 1' },
      { id: 2, name: 'Author 2' },
    ];

    await session.run(
      `
      UNWIND $authors AS authorData
      CREATE (a:Author {id: authorData.id, name: authorData.name})
      `,
      { authors }
    );

    // Seed posts
    const posts = [
      { id: 1, title: 'Post 1', content: 'Content of Post 1', authorId: 1 },
      { id: 2, title: 'Post 2', content: 'Content of Post 2', authorId: 2 },
    ];

    await session.run(
      `
      UNWIND $posts AS postData
      MATCH (a:Author {id: postData.authorId})
      CREATE (p:Post {id: postData.id, title: postData.title, content: postData.content})-[:AUTHORED_BY]->(a)
      `,
      { posts }
    );

    // Seed concepts, accounts, relationships, etc.
    // ...

  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  } finally {
    await session.close();
  }
}
