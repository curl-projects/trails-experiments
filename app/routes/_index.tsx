// // app/routes/index.tsx
// import { useLoaderData, Form, useActionData } from "@remix-run/react";
// import type { LoaderFunction, ActionFunction } from "@remix-run/node";
// import { json } from "@remix-run/node";
// import { useState } from "react";
// import driver from "~/db/neo4j.server";

// type NodeResult = {
//   id: string;
//   labels: string[];
//   properties: { [key: string]: any };
// };

// type LoaderData = {
//   results: NodeResult[];
// };

// type ActionData = {
//   strategyResults: {
//     strategyName: string;
//     results: any[];
//   }[];
// };

// export const loader: LoaderFunction = async ({ request }) => {
//   const url = new URL(request.url);
//   const keyword = url.searchParams.get("keyword");

//   if (!keyword) {
//     return json<LoaderData>({ results: [] });
//   }

//   const session = driver.session();
//   try {
//     const result = await session.run(
//       `
//       CALL db.index.fulltext.queryNodes("nodeSearch", $keyword) YIELD node, score
//       RETURN node, score LIMIT 50
//       `,
//       { keyword }
//     );

//     const nodes = result.records.map((record) => {
//       const node = record.get("node");
//       const properties = node.properties;
//       const labels = node.labels;
//       return { id: node.identity.toString(), labels, properties };
//     });

//     return json<LoaderData>({ results: nodes });
//   } finally {
//     await session.close();
//   }
// };

// export const action: ActionFunction = async ({ request }) => {
//   const formData = await request.formData();
//   const selectedNodeIds = formData.getAll("selectedNodeIds");

//   if (!selectedNodeIds || selectedNodeIds.length === 0) {
//     return json<ActionData>({ strategyResults: [] });
//   }

//   const session = driver.session();
//   try {
//     const nodeIds = selectedNodeIds.map((id) => parseInt(id.toString()));
//     const strategyResults = await Promise.all([
//       // Strategy 1: Accounts that often like posts conceptually similar to the selected nodes
//       (async () => {
//         const result = await session.run(
//           `
//           MATCH (n)-[:HAS_CONCEPT]->(concept:Concept)
//           WHERE id(n) IN $nodeIds
//           WITH collect(DISTINCT concept) AS concepts
//           UNWIND concepts AS concept
//           MATCH (similarPost:Post)-[:HAS_CONCEPT]->(concept)
//           WHERE NOT id(similarPost) IN $nodeIds
//           WITH collect(DISTINCT similarPost) AS similarPosts
//           UNWIND similarPosts AS similarPost
//           MATCH (account:Account)-[:LIKES]->(similarPost)
//           WITH account, count(similarPost) AS likeFrequency
//           WITH account, likeFrequency AS weight
//           WITH collect({account: account, weight: weight}) AS accounts
//           CALL apoc.coll.randomItemWeighted(accounts, 'weight') YIELD value AS sampledAccount
//           RETURN sampledAccount.account AS account, sampledAccount.weight AS likeFrequency
//           LIMIT 10
//           `,
//           { nodeIds }
//         );

//         const accounts = result.records.map((record) => ({
//           account: record.get("account").properties,
//           likeFrequency: record.get("likeFrequency"),
//         }));

//         return { strategyName: "Accounts Liking Similar Posts", results: accounts };
//       })(),
//       // Strategy 2: More posts by accounts that the accounts talk a lot to
//       (async () => {
//         const result = await session.run(
//           `
//           MATCH (n)-[:AUTHORED_BY]->(author:Author)
//           WHERE id(n) IN $nodeIds
//           MATCH (author)-[interaction:INTERACTS_WITH]->(otherAuthor:Author)
//           WHERE interaction.weight > $interactionThreshold
//           WITH collect(DISTINCT otherAuthor) AS otherAuthors
//           MATCH (relatedPost:Post)-[:AUTHORED_BY]->(otherAuthor)
//           WITH collect(DISTINCT relatedPost) AS relatedPosts
//           CALL apoc.coll.randomItemWeighted(relatedPosts, 'popularity') YIELD value AS randomOtherPost
//           RETURN randomOtherPost
//           LIMIT 10
//           `,
//           { nodeIds, interactionThreshold: 5 } // Adjust threshold as needed
//         );

//         const posts = result.records.map((record) => record.get("randomOtherPost").properties);

//         return { strategyName: "Posts by Interacted Authors", results: posts };
//       })(),
//       // Strategy 3: Additional strategies can be added here
//     ]);

//     return json<ActionData>({ strategyResults });
//   } finally {
//     await session.close();
//   }
// };

// export default function Index() {
//   const { results } = useLoaderData<LoaderData>();
//   const actionData = useActionData<ActionData>();
//   const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);

//   const handleNodeClick = (nodeId: string) => {
//     setSelectedNodeIds((prev) =>
//       prev.includes(nodeId) ? prev.filter((id) => id !== nodeId) : [...prev, nodeId]
//     );
//   };

//   return (
//     <div>
//       <h1>Graph Search</h1>
//       <Form method="get">
//         <input type="text" name="keyword" placeholder="Search..." />
//         <button type="submit">Search</button>
//       </Form>

//       {results.length > 0 && (
//         <div>
//           <h2>Search Results</h2>
//           <ul>
//             {results.map((node) => (
//               <li key={node.id}>
//                 <button
//                   type="button"
//                   onClick={() => handleNodeClick(node.id)}
//                   style={{
//                     backgroundColor: selectedNodeIds.includes(node.id) ? "#ddd" : "transparent",
//                   }}
//                 >
//                   {node.labels.join(", ")}: {node.properties.name || node.properties.id}
//                 </button>
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}

//       {selectedNodeIds.length > 0 && (
//         <Form method="post">
//           {selectedNodeIds.map((id) => (
//             <input key={id} type="hidden" name="selectedNodeIds" value={id} />
//           ))}
//           <button type="submit">Run Search Strategies</button>
//         </Form>
//       )}

//       {actionData && actionData.strategyResults.length > 0 && (
//         <div>
//           <h2>Search Strategies Results</h2>
//           {actionData.strategyResults.map((strategy, index) => (
//             <div key={index}>
//               <h3>{strategy.strategyName}</h3>
//               <ul>
//                 {strategy.results.map((item, idx) => (
//                   <li key={idx}>{JSON.stringify(item)}</li>
//                 ))}
//               </ul>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

import { redirect } from "@remix-run/node";

export let loader = async () => {
  return redirect("/feed-consumer");
};
