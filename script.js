// ============================================================
// ALGOVISTA | COMPLETE SCRIPT.JS
// Firebase Authentication + Firestore + DSA Concepts
// BFS + DFS + Dijkstra + Personal Notes
// ============================================================

// 1. FIREBASE IMPORTS
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


// 2. FIREBASE CONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyBhOU3kjKt3Xr-RwIkONCLBY4MfTqDSsJ0",
  authDomain: "algovista-dsa.firebaseapp.com",
  projectId: "algovista-dsa",
  storageBucket: "algovista-dsa.firebasestorage.app",
  messagingSenderId: "571812815203",
  appId: "1:571812815203:web:5df0ff395642628e637356",
  measurementId: "G-7JXM71GTHJ"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);


// 3. APPLICATION STATE
let currentUser = null;
let pendingProtectedPage = null;
let authMode = "login";
let notesCache = [];
let editingNoteId = null;

let currentAlgorithm = "bfs";
let algorithmSteps = [];
let currentStepIndex = -1;

const PROTECTED_PAGES = ["concepts", "visualizer", "notes"];


// 4. HELPER FUNCTIONS
const $ = id => document.getElementById(id);

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function showToast(message, type = "info") {
  const toast = $("toast");
  if (!toast) {
    console.log(message);
    return;
  }

  toast.textContent = message;
  toast.classList.remove("success", "error", "info");
  toast.classList.add(type);
  toast.classList.add("show");

  toast.style.display = "block";

  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
    toast.style.display = "";
  }, 3500);
}

function setMessage(id, message, type = "info") {
  const element = $(id);
  if (!element) return;

  element.textContent = message;
  element.classList.remove("success", "error", "info");

  if (message) element.classList.add(type);

  element.style.display = message ? "block" : "none";
}

function friendlyError(error) {
  const messages = {
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/user-not-found": "No account exists with this email.",
    "auth/wrong-password": "Incorrect email or password.",
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/email-already-in-use": "An account already exists with this email.",
    "auth/weak-password": "Password must contain at least 6 characters.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/network-request-failed": "Network error. Check your internet connection.",
    "auth/operation-not-allowed": "Enable Email/Password authentication in Firebase.",
    "permission-denied": "Access denied. Check your Firestore security rules.",
    "failed-precondition": "Firestore needs configuration. Check the Firebase console.",
    "unavailable": "Firebase is temporarily unavailable. Try again."
  };

  return messages[error?.code] || error?.message || "Something went wrong.";
}


// 5. DSA TOPICS
const topics = [
  {
    id: "arrays",
    title: "Arrays",
    category: "Data Structures",
    level: "Beginner",
    definition: "An array stores elements of the same data type in contiguous memory locations.",
    working: "Array elements are accessed using indexes. In C++, indexing starts at zero.",
    steps: [
      "Declare an array.",
      "Store values at different indexes.",
      "Access elements using their indexes.",
      "Traverse the array using a loop."
    ],
    example: "For arr = {10, 20, 30}, arr[0] is 10 and arr[2] is 30.",
    code: `#include <iostream>
using namespace std;

int main() {
    int arr[] = {10, 20, 30, 40};

    for (int i = 0; i < 4; i++) {
        cout << arr[i] << " ";
    }

    return 0;
}`,
    time: "Access: O(1), Search: O(n)",
    space: "O(n)",
    applications: ["Storing lists", "Searching and sorting", "Matrices"],
    questions: [
      "Find the largest element in an array.",
      "Reverse an array.",
      "Find the second-largest element."
    ]
  },
  {
    id: "linked-lists",
    title: "Linked Lists",
    category: "Data Structures",
    level: "Beginner",
    definition: "A linked list is a collection of nodes where each node stores data and a pointer to another node.",
    working: "Nodes are connected through pointers and do not need contiguous memory.",
    steps: [
      "Create a node.",
      "Store data in the node.",
      "Connect nodes using pointers.",
      "Traverse the list starting from the head."
    ],
    example: "10 -> 20 -> 30 -> NULL",
    code: `#include <iostream>
using namespace std;

struct Node {
    int data;
    Node* next;
};

int main() {
    Node second{20, nullptr};
    Node first{10, &second};

    cout << first.data << " ";
    cout << first.next->data;

    return 0;
}`,
    time: "Search: O(n), Insert at head: O(1)",
    space: "O(n)",
    applications: ["Dynamic data storage", "Queues", "Stacks"],
    questions: [
      "Reverse a linked list.",
      "Find the middle node.",
      "Detect a cycle in a linked list."
    ]
  },
  {
    id: "stacks",
    title: "Stacks",
    category: "Data Structures",
    level: "Beginner",
    definition: "A stack is a linear data structure that follows LIFO: Last In, First Out.",
    working: "The last element inserted is the first element removed.",
    steps: [
      "Insert an element using push().",
      "Read the top element using top().",
      "Remove the top element using pop().",
      "Check whether the stack is empty before accessing it."
    ],
    example: "Push 10 and then 20. The first pop removes 20.",
    code: `#include <iostream>
#include <stack>
using namespace std;

int main() {
    stack<int> s;

    s.push(10);
    s.push(20);
    s.push(30);

    cout << s.top() << endl;

    s.pop();

    cout << s.top();

    return 0;
}`,
    time: "Push: O(1), Pop: O(1), Top: O(1)",
    space: "O(n)",
    applications: ["Function calls", "Undo operations", "Expression evaluation"],
    questions: [
      "Reverse a string using a stack.",
      "Check balanced parentheses.",
      "Implement a stack using arrays."
    ]
  },
  {
    id: "queues",
    title: "Queues",
    category: "Data Structures",
    level: "Beginner",
    definition: "A queue is a linear data structure that follows FIFO: First In, First Out.",
    working: "The first element inserted is the first element removed.",
    steps: [
      "Insert an element using push().",
      "Read the front element using front().",
      "Remove the front element using pop().",
      "Check whether the queue is empty."
    ],
    example: "Insert 10, 20, 30. The first removal returns 10.",
    code: `#include <iostream>
#include <queue>
using namespace std;

int main() {
    queue<int> q;

    q.push(10);
    q.push(20);
    q.push(30);

    cout << q.front() << endl;

    q.pop();

    cout << q.front();

    return 0;
}`,
    time: "Push: O(1), Pop: O(1)",
    space: "O(n)",
    applications: ["BFS", "Task scheduling", "Printer queues"],
    questions: [
      "Implement a queue using arrays.",
      "Explain circular queues.",
      "Implement a queue using two stacks."
    ]
  },
  {
    id: "trees",
    title: "Trees",
    category: "Data Structures",
    level: "Intermediate",
    definition: "A tree is a hierarchical data structure made of nodes connected by edges.",
    working: "A tree contains a root and parent-child relationships and has no cycles.",
    steps: [
      "Identify the root node.",
      "Connect parent and child nodes.",
      "Choose a traversal method.",
      "Visit nodes in the required order."
    ],
    example: "A binary tree has at most two children per node.",
    code: `struct Node {
    int data;
    Node* left;
    Node* right;
};

Node root{10, nullptr, nullptr};
Node leftChild{5, nullptr, nullptr};
Node rightChild{15, nullptr, nullptr};

root.left = &leftChild;
root.right = &rightChild;`,
    time: "Balanced BST search: O(log n); worst case: O(n)",
    space: "O(n)",
    applications: ["File systems", "Search trees", "Hierarchical data"],
    questions: [
      "Explain inorder, preorder and postorder.",
      "Find the height of a binary tree.",
      "Explain binary search trees."
    ]
  },
  {
    id: "graphs",
    title: "Graphs",
    category: "Data Structures",
    level: "Intermediate",
    definition: "A graph consists of vertices (nodes) and edges connecting them.",
    working: "Graphs may be directed or undirected and weighted or unweighted.",
    steps: [
      "Identify the vertices.",
      "Represent connections using an adjacency list or matrix.",
      "Choose a traversal or path algorithm.",
      "Process the vertices and edges."
    ],
    example: "If A is connected to B and C, its adjacency list is A: B, C.",
    code: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<vector<int>> adj(3);

    adj[0] = {1, 2};
    adj[1] = {0};
    adj[2] = {0};

    for (int node : adj[0]) {
        cout << node << " ";
    }

    return 0;
}`,
    time: "Adjacency-list traversal: O(V + E)",
    space: "O(V + E)",
    applications: ["Social networks", "Maps", "Computer networks"],
    questions: [
      "Compare adjacency lists and matrices.",
      "Explain BFS and DFS.",
      "Explain directed and undirected graphs."
    ]
  },
  {
    id: "searching",
    title: "Searching",
    category: "Algorithms",
    level: "Beginner",
    definition: "Searching algorithms find a target value in a collection.",
    working: "Linear search checks elements one by one. Binary search halves a sorted search range repeatedly.",
    steps: [
      "Choose a searching algorithm.",
      "For linear search, inspect each element.",
      "For binary search, calculate the middle index.",
      "Continue until the target is found or the range is empty."
    ],
    example: "Binary search can find 30 in {10, 20, 30, 40, 50}.",
    code: `int binarySearch(int arr[], int n, int target) {
    int left = 0, right = n - 1;

    while (left <= right) {
        int mid = left + (right - left) / 2;

        if (arr[mid] == target)
            return mid;

        if (arr[mid] < target)
            left = mid + 1;
        else
            right = mid - 1;
    }

    return -1;
}`,
    time: "Linear: O(n), Binary: O(log n)",
    space: "Iterative binary search: O(1)",
    applications: ["Finding records", "Database queries", "Lookup operations"],
    questions: [
      "Implement linear search.",
      "Implement binary search.",
      "Compare linear and binary search."
    ]
  },
  {
    id: "sorting",
    title: "Sorting",
    category: "Algorithms",
    level: "Beginner",
    definition: "Sorting arranges elements in ascending or descending order.",
    working: "Sorting algorithms rearrange elements by comparing them or dividing the problem into smaller parts.",
    steps: [
      "Choose a sorting algorithm.",
      "Compare elements as required.",
      "Move elements into their correct positions.",
      "Repeat until the collection is sorted."
    ],
    example: "{4, 2, 3, 1} becomes {1, 2, 3, 4}.",
    code: `#include <iostream>
#include <algorithm>
using namespace std;

int main() {
    int arr[] = {4, 2, 3, 1};

    sort(arr, arr + 4);

    for (int x : arr)
        cout << x << " ";

    return 0;
}`,
    time: "std::sort: O(n log n) average",
    space: "Implementation-dependent auxiliary space",
    applications: ["Ranking", "Data processing", "Efficient searching"],
    questions: [
      "Explain bubble sort.",
      "Compare merge sort and quicksort.",
      "Sort an array without using sort()."
    ]
  },
  {
    id: "recursion",
    title: "Recursion",
    category: "Algorithms",
    level: "Intermediate",
    definition: "Recursion occurs when a function calls itself to solve smaller versions of a problem.",
    working: "A recursive solution requires a base case and a recursive case.",
    steps: [
      "Define the base case.",
      "Reduce the problem size.",
      "Call the function recursively.",
      "Return the result when the base case is reached."
    ],
    example: "4! = 4 × 3 × 2 × 1 = 24.",
    code: `int factorial(int n) {
    if (n <= 1)
        return 1;

    return n * factorial(n - 1);
}`,
    time: "Factorial: O(n)",
    space: "O(n) call stack for factorial",
    applications: ["Tree traversal", "Divide and conquer", "Backtracking"],
    questions: [
      "Calculate factorial recursively.",
      "Print Fibonacci numbers.",
      "Explain base cases and stack overflow."
    ]
  },
  {
    id: "dynamic-programming",
    title: "Dynamic Programming",
    category: "Algorithms",
    level: "Advanced",
    definition: "Dynamic programming solves problems by storing results of overlapping subproblems.",
    working: "It avoids repeated calculations using memoization or tabulation.",
    steps: [
      "Identify overlapping subproblems.",
      "Define the state.",
      "Write the recurrence relation.",
      "Store computed results.",
      "Build the final answer."
    ],
    example: "Fibonacci values can be stored so that each value is calculated only once.",
    code: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n = 6;
    vector<int> dp(n + 1);

    dp[0] = 0;
    dp[1] = 1;

    for (int i = 2; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }

    cout << dp[n];

    return 0;
}`,
    time: "Fibonacci tabulation: O(n)",
    space: "O(n)",
    applications: ["Knapsack", "Shortest paths", "Sequence problems"],
    questions: [
      "Explain memoization and tabulation.",
      "Solve Fibonacci using dynamic programming.",
      "Explain the 0/1 knapsack problem."
    ]
  }
];
// 6. GRAPH DATA AND ALGORITHM NOTES
const graphNodes = [
  { id: "A", x: 70, y: 130 },
  { id: "B", x: 190, y: 55 },
  { id: "C", x: 190, y: 210 },
  { id: "D", x: 350, y: 55 },
  { id: "E", x: 350, y: 210 },
  { id: "F", x: 490, y: 130 }
];

const graphEdges = [
  { from: "A", to: "B", weight: 4 },
  { from: "A", to: "C", weight: 2 },
  { from: "B", to: "C", weight: 1 },
  { from: "B", to: "D", weight: 5 },
  { from: "C", to: "E", weight: 8 },
  { from: "D", to: "E", weight: 2 },
  { from: "D", to: "F", weight: 6 },
  { from: "E", to: "F", weight: 3 }
];

const algorithmNotes = {
  bfs: {
    title: "Breadth-First Search (BFS)",
    definition: "BFS visits nearby nodes before exploring nodes farther away.",
    steps: [
      "Mark the start node visited.",
      "Add it to a queue.",
      "Remove the front node.",
      "Add its unvisited neighbours to the queue.",
      "Repeat until the queue is empty."
    ],
    example: "BFS explores a graph level by level.",
    complexity: "O(V + E)",
    space: "O(V)",
    tip: "BFS finds shortest paths in unweighted graphs.",
    code: `void bfs(int start, vector<vector<int>>& adj) {
    vector<bool> visited(adj.size(), false);
    queue<int> q;

    visited[start] = true;
    q.push(start);

    while (!q.empty()) {
        int node = q.front();
        q.pop();
        cout << node << " ";

        for (int next : adj[node]) {
            if (!visited[next]) {
                visited[next] = true;
                q.push(next);
            }
        }
    }
}`
  },
  dfs: {
    title: "Depth-First Search (DFS)",
    definition: "DFS explores one path deeply before backtracking.",
    steps: [
      "Visit the current node.",
      "Mark it visited.",
      "Explore an unvisited neighbour.",
      "Continue deeper into the graph.",
      "Backtrack when no unvisited neighbours remain."
    ],
    example: "DFS explores a branch before moving to another branch.",
    complexity: "O(V + E)",
    space: "O(V)",
    tip: "DFS is useful for cycle detection and topological sorting.",
    code: `void dfs(int node, vector<vector<int>>& adj,
         vector<bool>& visited) {
    visited[node] = true;
    cout << node << " ";

    for (int next : adj[node]) {
        if (!visited[next]) {
            dfs(next, adj, visited);
        }
    }
}`
  },
  dijkstra: {
    title: "Dijkstra's Shortest Path Algorithm",
    definition: "Dijkstra finds shortest distances from a source in a weighted graph with non-negative weights.",
    steps: [
      "Set the source distance to zero.",
      "Set all other distances to infinity.",
      "Select the unprocessed node with the smallest distance.",
      "Relax its edges.",
      "Repeat for reachable nodes."
    ],
    example: "If A to B costs 4 and A to C costs 2, their initial distances are 4 and 2.",
    complexity: "O((V + E) log V) with a priority queue",
    space: "O(V + E)",
    tip: "Dijkstra does not support arbitrary negative edge weights.",
    code: `vector<int> dijkstra(
    int start,
    vector<vector<pair<int, int>>>& adj
) {
    const int INF = 1e9;
    int n = adj.size();

    vector<int> dist(n, INF);
    priority_queue<
        pair<int, int>,
        vector<pair<int, int>>,
        greater<pair<int, int>>
    > pq;

    dist[start] = 0;
    pq.push({0, start});

    while (!pq.empty()) {
        auto [d, node] = pq.top();
        pq.pop();

        if (d != dist[node]) continue;

        for (auto [next, weight] : adj[node]) {
            if (dist[node] + weight < dist[next]) {
                dist[next] = dist[node] + weight;
                pq.push({dist[next], next});
            }
        }
    }

    return dist;
}`
  }
};

function buildAdjacencyList() {
  const adj = {};

  graphNodes.forEach(node => {
    adj[node.id] = [];
  });

  graphEdges.forEach(edge => {
    adj[edge.from].push({ node: edge.to, weight: edge.weight });
    adj[edge.to].push({ node: edge.from, weight: edge.weight });
  });

  return adj;
}

function getNodePosition(id) {
  return graphNodes.find(node => node.id === id);
}


// 7. TOPIC RENDERING — MATCHES YOUR HTML IDS
function createTopicCard(topic) {
  return `
    <article class="topic-card">
      <div class="topic-card-header">
        <span class="topic-category">${escapeHTML(topic.category)}</span>
        <span class="topic-level">${escapeHTML(topic.level)}</span>
      </div>
      <h3>${escapeHTML(topic.title)}</h3>
      <p>${escapeHTML(topic.definition)}</p>
      <button type="button" class="btn primary"
        data-topic="${escapeHTML(topic.id)}">Learn More</button>
      <button type="button" class="btn secondary"
        data-save-topic="${escapeHTML(topic.id)}">Save to My Notes</button>
    </article>
  `;
}

function renderTopics() {
  const allTopics = $("allTopics");
  const featuredTopics = $("featuredTopics");

  if (allTopics) {
    allTopics.innerHTML = topics.map(createTopicCard).join("");

    // Explicitly handle Learn More clicks inside the Concepts topic list.
    allTopics.onclick = event => {
      const button = event.target.closest("button[data-topic]");
      if (!button || !allTopics.contains(button)) return;

      event.preventDefault();
      event.stopPropagation();
      showTopic(button.dataset.topic);
    };
  }

  if (featuredTopics) {
    featuredTopics.innerHTML = topics.slice(0, 4)
      .map(createTopicCard).join("");

    // Explicitly handle Learn More clicks on Home featured cards.
    featuredTopics.onclick = event => {
      const button = event.target.closest("button[data-topic]");
      if (!button || !featuredTopics.contains(button)) return;

      event.preventDefault();
      event.stopPropagation();
      showTopic(button.dataset.topic);
    };
  }

  const noteTopic = $("noteTopic");

  if (noteTopic) {
    const previousValue = noteTopic.value;

    noteTopic.innerHTML = `
      <option value="General">General</option>
      ${topics.map(topic => `
        <option value="${escapeHTML(topic.title)}">
          ${escapeHTML(topic.title)}
        </option>
      `).join("")}
      <option value="Graph Algorithms">Graph Algorithms</option>
    `;

    if ([...noteTopic.options].some(option => option.value === previousValue)) {
      noteTopic.value = previousValue;
    }
  }
}

function showTopic(id) {
  const topic = topics.find(item => item.id === id);
  if (!topic) return;

  // Open Concepts first so topicDetail is visible before scrolling.
  goToPage("concepts");

  const detail = $("topicDetail");
  if (!detail) {
    console.error('Learn More could not find an element with id="topicDetail".');
    showToast("Topic details section was not found. Please check index.html.", "error");
    return;
  }

  detail.innerHTML = `
    <h2>${escapeHTML(topic.title)}</h2>
    <p><strong>Category:</strong> ${escapeHTML(topic.category)}</p>
    <p><strong>Definition:</strong> ${escapeHTML(topic.definition)}</p>
    <p><strong>How it works:</strong> ${escapeHTML(topic.working)}</p>

    <h3>Steps</h3>
    <ol>${topic.steps.map(step => `<li>${escapeHTML(step)}</li>`).join("")}</ol>

    <h3>Example</h3>
    <p>${escapeHTML(topic.example)}</p>

    <h3>C++ Code</h3>
    <pre class="code-example"><code>${escapeHTML(topic.code)}</code></pre>

    <p><strong>Time Complexity:</strong> ${escapeHTML(topic.time)}</p>
    <p><strong>Space Complexity:</strong> ${escapeHTML(topic.space)}</p>

    <h3>Applications</h3>
    <ul>${topic.applications.map(item => `<li>${escapeHTML(item)}</li>`).join("")}</ul>

    <h3>Practice Questions</h3>
    <ol>${topic.questions.map(item => `<li>${escapeHTML(item)}</li>`).join("")}</ol>

    <button type="button" class="btn secondary"
      data-save-topic="${escapeHTML(topic.id)}">Save to My Notes</button>
  `;

  detail.classList.remove("hidden");
  detail.scrollIntoView({ behavior: "smooth", block: "start" });
}

function searchTopics(searchText) {
  const container = $("allTopics");
  if (!container) return;

  const text = searchText.toLowerCase().trim();

  const filtered = topics.filter(topic =>
    topic.title.toLowerCase().includes(text) ||
    topic.category.toLowerCase().includes(text) ||
    topic.definition.toLowerCase().includes(text)
  );

  container.innerHTML = filtered.length
    ? filtered.map(createTopicCard).join("")
    : "<p class='muted'>No matching topics found.</p>";
}


// 8. GRAPH RENDERING
function populateNodeSelectors() {
  const options = graphNodes.map(node =>
    `<option value="${node.id}">${node.id}</option>`
  ).join("");

  const start = $("startNodeSelect");
  const target = $("targetNodeSelect");

  if (start && !start.options.length) start.innerHTML = options;
  if (target && !target.options.length) target.innerHTML = options;

  if (start && !start.value) start.value = "A";
  if (target && !target.value) target.value = "F";
}

function renderGraph(highlight = {}) {
  const svg = $("graphSvg");
  if (!svg) return;

  const visited = new Set(highlight.visited || []);
  const path = new Set(highlight.path || []);
  const current = highlight.current || null;

  svg.setAttribute("viewBox", "0 0 550 270");

  const edges = graphEdges.map(edge => {
    const from = getNodePosition(edge.from);
    const to = getNodePosition(edge.to);

    const inPath = path.has(edge.from) && path.has(edge.to);
    const middleX = (from.x + to.x) / 2;
    const middleY = (from.y + to.y) / 2;

    return `
      <g>
        <line x1="${from.x}" y1="${from.y}"
          x2="${to.x}" y2="${to.y}"
          stroke="${inPath ? "#16a34a" : "#94a3b8"}"
          stroke-width="${inPath ? 5 : 2}"/>
        <text x="${middleX}" y="${middleY - 8}"
          text-anchor="middle" fill="currentColor"
          font-size="13">${edge.weight}</text>
      </g>
    `;
  }).join("");

  const nodes = graphNodes.map(node => {
    const isCurrent = node.id === current;
    const isPath = path.has(node.id);
    const fill = isCurrent ? "#2563eb" :
      isPath ? "#bbf7d0" :
      visited.has(node.id) ? "#bfdbfe" : "#ffffff";

    return `
      <g>
        <circle cx="${node.x}" cy="${node.y}"
          r="${isCurrent ? 22 : 19}" fill="${fill}"
          stroke="${isCurrent ? "#1d4ed8" : "#64748b"}"
          stroke-width="2"/>
        <text x="${node.x}" y="${node.y + 5}"
          text-anchor="middle"
          fill="${isCurrent ? "#ffffff" : "#172554"}"
          font-size="15" font-weight="bold">${node.id}</text>
      </g>
    `;
  }).join("");

  svg.innerHTML = edges + nodes;

  const edgeList = $("edgeList");
  if (edgeList) {
    edgeList.innerHTML = graphEdges.map(edge => `
      <div class="edge-item">
        ${edge.from} ↔ ${edge.to}
        <span>Weight: ${edge.weight}</span>
      </div>
    `).join("");
  }
}


// 9. GRAPH ALGORITHM STEP GENERATORS
function buildBFS(start) {
  const adj = buildAdjacencyList();
  const visited = new Set([start]);
  const queue = [start];
  const steps = [];

  steps.push({
    explanation: `Start at ${start}. Mark it visited and add it to the queue.`,
    current: start, visited: [...visited], queue: [...queue],
    stack: [], distances: {}, path: []
  });

  while (queue.length) {
    const node = queue.shift();

    steps.push({
      explanation: `Remove ${node} from the queue and process it.`,
      current: node, visited: [...visited], queue: [...queue],
      stack: [], distances: {}, path: []
    });

    for (const edge of adj[node]) {
      if (!visited.has(edge.node)) {
        visited.add(edge.node);
        queue.push(edge.node);

        steps.push({
          explanation: `Discover ${edge.node} from ${node}. Add it to the queue.`,
          current: edge.node, visited: [...visited], queue: [...queue],
          stack: [], distances: {}, path: []
        });
      }
    }
  }

  steps.push({
    explanation: "BFS is complete.",
    current: null, visited: [...visited], queue: [],
    stack: [], distances: {}, path: []
  });

  return steps;
}

function buildDFS(start) {
  const adj = buildAdjacencyList();
  const visited = new Set();
  const stack = [];
  const steps = [];

  function visit(node) {
    visited.add(node);
    stack.push(node);

    steps.push({
      explanation: `Visit ${node} and explore its unvisited neighbours.`,
      current: node, visited: [...visited], queue: [],
      stack: [...stack], distances: {}, path: []
    });

    for (const edge of adj[node]) {
      if (!visited.has(edge.node)) visit(edge.node);
    }

    stack.pop();

    steps.push({
      explanation: `Finish exploring ${node} and backtrack.`,
      current: stack.length ? stack[stack.length - 1] : node,
      visited: [...visited], queue: [],
      stack: [...stack], distances: {}, path: []
    });
  }

  visit(start);

  steps.push({
    explanation: "DFS is complete.",
    current: null, visited: [...visited], queue: [],
    stack: [], distances: {}, path: []
  });

  return steps;
}

function buildDijkstra(start, target) {
  const adj = buildAdjacencyList();
  const dist = {};
  const previous = {};
  const unvisited = new Set(graphNodes.map(node => node.id));
  const steps = [];

  graphNodes.forEach(node => {
    dist[node.id] = Infinity;
    previous[node.id] = null;
  });

  dist[start] = 0;

  steps.push({
    explanation: `Initialize distances. ${start} = 0; all others = infinity.`,
    current: start, visited: [], queue: [], stack: [],
    distances: { ...dist }, path: []
  });

  while (unvisited.size) {
    let current = null;

    for (const node of unvisited) {
      if (current === null || dist[node] < dist[current]) current = node;
    }

    if (current === null || dist[current] === Infinity) break;

    unvisited.delete(current);

    for (const edge of adj[current]) {
      if (!unvisited.has(edge.node)) continue;

      const candidate = dist[current] + edge.weight;

      if (candidate < dist[edge.node]) {
        dist[edge.node] = candidate;
        previous[edge.node] = current;
      }
    }

    steps.push({
      explanation: `Process ${current}. Its shortest known distance is ${dist[current]}.`,
      current,
      visited: graphNodes.filter(node => !unvisited.has(node.id)).map(node => node.id),
      queue: [], stack: [], distances: { ...dist }, path: []
    });
  }

  const path = [];

  if (dist[target] !== Infinity) {
    let node = target;

    while (node !== null) {
      path.unshift(node);
      if (node === start) break;
      node = previous[node];
    }

    if (path[0] !== start) path.length = 0;
  }

  steps.push({
    explanation: path.length
      ? `Shortest distance from ${start} to ${target} is ${dist[target]}. Path: ${path.join(" → ")}.`
      : `No path exists from ${start} to ${target}.`,
    current: target,
    visited: graphNodes.filter(node => !unvisited.has(node.id)).map(node => node.id),
    queue: [], stack: [], distances: { ...dist }, path
  });

  return steps;
}


// 10. VISUALIZER CONTROLS
function renderAlgorithmGuide() {
  const algorithm = $("algorithmSelect")?.value || currentAlgorithm;
  currentAlgorithm = algorithm;

  const item = algorithmNotes[algorithm];
  const container = $("algorithmGuide");

  if (!item || !container) return;

  container.innerHTML = `
    <h3>${escapeHTML(item.title)}</h3>
    <p>${escapeHTML(item.definition)}</p>
    <h4>Steps</h4>
    <ol>${item.steps.map(step => `<li>${escapeHTML(step)}</li>`).join("")}</ol>
    <h4>Example</h4>
    <p>${escapeHTML(item.example)}</p>
    <p><strong>Time:</strong> ${escapeHTML(item.complexity)}</p>
    <p><strong>Space:</strong> ${escapeHTML(item.space)}</p>
    <p><strong>Important:</strong> ${escapeHTML(item.tip)}</p>
    <h4>C++ Implementation</h4>
    <pre class="code-example"><code>${escapeHTML(item.code)}</code></pre>
    <button type="button" class="btn secondary"
      data-save-algorithm="${algorithm}">Save Algorithm Notes</button>
  `;

  const targetField = $("targetField");
  if (targetField) {
    targetField.style.display = algorithm === "dijkstra" ? "" : "none";
  }

  const distancePanel = $("distancePanel");
  if (distancePanel) {
    distancePanel.classList.toggle("hidden", algorithm !== "dijkstra");
  }
}

function startAlgorithm() {
  if (!auth.currentUser) {
    pendingProtectedPage = "visualizer";
    openAuth("login");
    setMessage("authMessage", "Please sign in to use the visualizer.", "error");
    return;
  }

  currentAlgorithm = $("algorithmSelect")?.value || "bfs";
  const start = $("startNodeSelect")?.value || "A";
  const target = $("targetNodeSelect")?.value || "F";

  if (currentAlgorithm === "bfs") {
    algorithmSteps = buildBFS(start);
  } else if (currentAlgorithm === "dfs") {
    algorithmSteps = buildDFS(start);
  } else {
    algorithmSteps = buildDijkstra(start, target);
  }

  currentStepIndex = 0;
  updateStepPanel();
  renderAlgorithmGuide();
}

function nextStep() {
  if (!auth.currentUser) {
    pendingProtectedPage = "visualizer";
    openAuth("login");
    return;
  }

  if (!algorithmSteps.length) {
    showToast("Click Run first.");
    return;
  }

  if (currentStepIndex < algorithmSteps.length - 1) {
    currentStepIndex++;
    updateStepPanel();
  } else {
    showToast("Algorithm completed.");
  }
}

function resetAlgorithm() {
  algorithmSteps = [];
  currentStepIndex = -1;

  if ($("stepCounter")) $("stepCounter").textContent = "Ready to start";
  if ($("stepExplanation")) $("stepExplanation").textContent = "Press Run to generate the steps.";
  if ($("stepList")) $("stepList").innerHTML = "";
  if ($("structureValue")) $("structureValue").textContent = "—";
  if ($("visitedValue")) $("visitedValue").textContent = "—";
  if ($("currentValue")) $("currentValue").textContent = "—";
  if ($("distanceTable")) $("distanceTable").innerHTML = "";
  if ($("pathResult")) $("pathResult").textContent = "";

  if ($("nextButton")) $("nextButton").disabled = true;

  renderGraph();
}

function updateStepPanel() {
  const step = algorithmSteps[currentStepIndex];
  if (!step) return;

  if ($("stepCounter")) {
    $("stepCounter").textContent = `${currentStepIndex + 1} / ${algorithmSteps.length}`;
  }

  if ($("stepExplanation")) $("stepExplanation").textContent = step.explanation;
  if ($("currentValue")) $("currentValue").textContent = step.current ?? "—";
  if ($("visitedValue")) $("visitedValue").textContent = step.visited.join(", ") || "—";

  if ($("structureLabel") && $("structureValue")) {
    $("structureLabel").textContent =
      currentAlgorithm === "bfs" ? "Queue" :
      currentAlgorithm === "dfs" ? "Stack" : "Distances";

    $("structureValue").textContent =
      currentAlgorithm === "bfs" ? (step.queue.join(" → ") || "Empty") :
      currentAlgorithm === "dfs" ? (step.stack.join(" → ") || "Empty") :
      "Smallest distance first";
  }

  if ($("distanceTable")) {
    $("distanceTable").innerHTML = currentAlgorithm === "dijkstra"
      ? `<table><thead><tr><th>Node</th><th>Distance</th></tr></thead><tbody>
        ${graphNodes.map(node => `<tr><td>${node.id}</td><td>${
          step.distances[node.id] === Infinity ? "∞" : step.distances[node.id]
        }</td></tr>`).join("")}
        </tbody></table>`
      : "";
  }

  if ($("pathResult")) {
    $("pathResult").textContent =
      currentAlgorithm === "dijkstra" && step.path.length
        ? `Shortest path: ${step.path.join(" → ")}`
        : "";
  }

  if ($("stepList")) {
    $("stepList").innerHTML = algorithmSteps.slice(0, currentStepIndex + 1)
      .map((item, index) => `
        <div class="step-item ${index === currentStepIndex ? "active" : ""}">
          <strong>Step ${index + 1}</strong>
          <p>${escapeHTML(item.explanation)}</p>
        </div>
      `).join("");
  }

  if ($("nextButton")) {
    $("nextButton").disabled = currentStepIndex >= algorithmSteps.length - 1;
  }

  renderGraph({
    visited: step.visited,
    current: step.current,
    path: step.path
  });
}
// 11. AUTHENTICATION MODAL
function openAuth(mode = "login") {
  authMode = mode === "register" || mode === "signup" ? "signup" : "login";

  const modal = $("authModal");
  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("active");
    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");
  }

  renderAuthMode();
}

function closeAuth() {
  const modal = $("authModal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("active");
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
  }

  setMessage("authMessage", "");
}

function renderAuthMode() {
  if ($("authTitle")) {
    $("authTitle").textContent =
      authMode === "signup" ? "Create Account" : "Welcome back";
  }

  if ($("authDescription")) {
    $("authDescription").textContent = authMode === "signup"
      ? "Create an account to access your visualizer and personal notes."
      : "Sign in to access your visualizer and personal notes.";
  }

  if ($("authSubmitButton")) {
    $("authSubmitButton").textContent =
      authMode === "signup" ? "Create account" : "Sign in";
  }

  if ($("displayNameField")) {
    $("displayNameField").classList.toggle("hidden", authMode !== "signup");
  }

  if ($("forgotPasswordButton")) {
    $("forgotPasswordButton").style.display =
      authMode === "signup" ? "none" : "";
  }

  document.querySelectorAll("[data-auth-mode]").forEach(button => {
    const mode = button.dataset.authMode;

    button.classList.toggle(
      "active",
      (mode === "register" || mode === "signup") === (authMode === "signup")
    );
  });

  setMessage("authMessage", "");
}

async function submitAuth(event) {
  event.preventDefault();

  const email = $("emailInput")?.value.trim();
  const password = $("passwordInput")?.value;
  const displayName = $("displayNameInput")?.value.trim();

  if (!email || !password) {
    setMessage("authMessage", "Enter your email and password.", "error");
    return;
  }

  const button = $("authSubmitButton");
  if (button) button.disabled = true;

  try {
    if (authMode === "signup") {
      if (password.length < 6) {
        setMessage(
          "authMessage",
          "Password must contain at least 6 characters.",
          "error"
        );
        return;
      }

      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      if (displayName) {
        await updateProfile(credential.user, { displayName });
      }

      showToast("Account created successfully!", "success");
    } else {
      await signInWithEmailAndPassword(auth, email, password);
      showToast("Signed in successfully!", "success");
    }

    closeAuth();

    if (pendingProtectedPage) {
      const page = pendingProtectedPage;
      pendingProtectedPage = null;
      goToPage(page);
    }
  } catch (error) {
    setMessage("authMessage", friendlyError(error), "error");
  } finally {
    if (button) button.disabled = false;
  }
}

async function resetPassword() {
  const email = $("emailInput")?.value.trim();

  if (!email) {
    setMessage("authMessage", "Enter your email address first.", "error");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);

    setMessage(
      "authMessage",
      "Password reset email sent. Check your inbox.",
      "success"
    );
  } catch (error) {
    setMessage("authMessage", friendlyError(error), "error");
  }
}

async function logoutUser() {
  try {
    await signOut(auth);
    closeAuth();
    showToast("Signed out successfully.", "success");
    goToPage("home");
  } catch (error) {
    showToast(friendlyError(error), "error");
  }
}

function updateAccountUI(user) {
  if ($("userLabel")) {
    $("userLabel").textContent = user
      ? (user.displayName || user.email)
      : "Guest mode";
  }

  if ($("authButton")) {
    $("authButton").textContent = user ? "Account" : "Sign in";
    $("authButton").classList.toggle("hidden", !!user);
  }

  if ($("logoutButton")) {
    $("logoutButton").classList.toggle("hidden", !user);
  }
}


// 12. NAVIGATION — HOME IS PUBLIC, OTHER PAGES REQUIRE LOGIN
function goToPage(page) {
  const normalizedPage = String(page || "").replace(/Page$/, "");

  if (!["home", "concepts", "visualizer", "notes"].includes(normalizedPage)) {
    return;
  }

  // Protect Concepts, Visualizer, and Notes.
  if (PROTECTED_PAGES.includes(normalizedPage) && !auth.currentUser) {
    pendingProtectedPage = normalizedPage;
    openAuth("login");
    setMessage(
      "authMessage",
      "Please sign in to access this page.",
      "error"
    );
    return;
  }

  const target = $(`${normalizedPage}Page`);

  if (!target) {
    console.error("Page element not found:", `${normalizedPage}Page`);
    return;
  }

  document.querySelectorAll("main .page").forEach(section => {
    section.classList.remove("active");
    section.setAttribute("aria-hidden", "true");
  });

  target.classList.add("active");
  target.setAttribute("aria-hidden", "false");

  document.querySelectorAll(".nav-btn").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.page === normalizedPage
    );
  });

  if (normalizedPage === "notes") {
    loadNotes();
  }

  if (normalizedPage === "visualizer") {
    renderGraph();
    renderAlgorithmGuide();
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}


// 13. PERSONAL NOTES — FIRESTORE
function getUserNotesCollection() {
  if (!auth.currentUser) {
    throw new Error("Please sign in to access your notes.");
  }

  return collection(db, "users", auth.currentUser.uid, "notes");
}

async function loadNotes() {
  if (!auth.currentUser) return;

  try {
    let snapshot;

    try {
      snapshot = await getDocs(
        query(
          getUserNotesCollection(),
          orderBy("updatedAt", "desc")
        )
      );
    } catch {
      snapshot = await getDocs(getUserNotesCollection());
    }

    notesCache = snapshot.docs.map(item => ({
      id: item.id,
      ...item.data()
    }));

    renderNotes();
  } catch (error) {
    setMessage("notesMessage", friendlyError(error), "error");
  }
}

function renderNotes() {
  const container = $("notesList");

  if ($("notesCount")) {
    $("notesCount").textContent = String(notesCache.length);
  }

  if (!container) return;

  if (!auth.currentUser) {
    container.innerHTML = `
      <div class="empty-state">
        Please sign in to view your notes.
      </div>
    `;
    return;
  }

  if (!notesCache.length) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>No notes yet</h3>
        <p>Create your first personal DSA note.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = notesCache.map(note => `
    <article class="note-item">
      <div class="note-item-head">
        <div>
          <h3>${escapeHTML(note.title || "Untitled note")}</h3>
          <span class="note-meta">
            ${escapeHTML(note.topic || "General")}
          </span>
        </div>

        <div class="note-actions">
          <button
            type="button"
            class="mini-button"
            data-edit-note="${escapeHTML(note.id)}">
            Edit
          </button>

          <button
            type="button"
            class="mini-button delete"
            data-delete-note="${escapeHTML(note.id)}">
            Delete
          </button>
        </div>
      </div>

      <p class="note-content">${escapeHTML(note.content || "")}</p>
    </article>
  `).join("");
}

function resetNoteForm() {
  editingNoteId = null;

  $("noteForm")?.reset();

  if ($("noteId")) {
    $("noteId").value = "";
  }

  if ($("noteFormTitle")) {
    $("noteFormTitle").textContent = "Create a note";
  }

  setMessage("notesMessage", "");
}

async function saveNote(event) {
  event.preventDefault();

  if (!auth.currentUser) {
    pendingProtectedPage = "notes";
    openAuth("login");

    setMessage(
      "authMessage",
      "Sign in before saving notes.",
      "error"
    );
    return;
  }

  const title = $("noteTitle")?.value.trim();
  const topic = $("noteTopic")?.value || "General";
  const content = $("noteContent")?.value.trim();

  if (!title || !content) {
    setMessage(
      "notesMessage",
      "Enter a title and note content.",
      "error"
    );
    return;
  }

  try {
    const data = {
      title,
      topic,
      content,
      updatedAt: serverTimestamp()
    };

    if (editingNoteId) {
      await updateDoc(
        doc(
          db,
          "users",
          auth.currentUser.uid,
          "notes",
          editingNoteId
        ),
        data
      );

      showToast("Note updated.", "success");
    } else {
      await addDoc(getUserNotesCollection(), {
        ...data,
        createdAt: serverTimestamp()
      });

      showToast("Note saved.", "success");
    }

    resetNoteForm();
    await loadNotes();
  } catch (error) {
    setMessage("notesMessage", friendlyError(error), "error");
  }
}

function editNote(id) {
  if (!auth.currentUser) return;

  const note = notesCache.find(item => item.id === id);
  if (!note) return;

  editingNoteId = id;

  if ($("noteId")) $("noteId").value = id;
  if ($("noteTitle")) $("noteTitle").value = note.title || "";
  if ($("noteTopic")) $("noteTopic").value = note.topic || "General";
  if ($("noteContent")) $("noteContent").value = note.content || "";

  if ($("noteFormTitle")) {
    $("noteFormTitle").textContent = "Edit note";
  }

  $("noteForm")?.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

async function deleteNote(id) {
  if (!auth.currentUser) return;

  const note = notesCache.find(item => item.id === id);
  if (!note) return;

  if (!confirm(`Delete "${note.title || "this note"}"?`)) {
    return;
  }

  try {
    await deleteDoc(
      doc(db, "users", auth.currentUser.uid, "notes", id)
    );

    showToast("Note deleted.", "success");
    await loadNotes();
  } catch (error) {
    setMessage("notesMessage", friendlyError(error), "error");
  }
}

function prepareTopicNote(topicId) {
  if (!auth.currentUser) {
    pendingProtectedPage = "notes";
    openAuth("login");

    setMessage(
      "authMessage",
      "Sign in to save personal notes.",
      "error"
    );
    return;
  }

  const topic = topics.find(item => item.id === topicId);
  if (!topic) return;

  goToPage("notes");
  resetNoteForm();

  if ($("noteTitle")) $("noteTitle").value = topic.title;
  if ($("noteTopic")) $("noteTopic").value = topic.title;

  if ($("noteContent")) {
    $("noteContent").value =
      `${topic.definition}\n\nHow it works:\n${topic.working}\n\n` +
      `Steps:\n${topic.steps.map(
        (step, i) => `${i + 1}. ${step}`
      ).join("\n")}\n\n` +
      `Example:\n${topic.example}\n\n` +
      `Time Complexity: ${topic.time}\n` +
      `Space Complexity: ${topic.space}\n\n` +
      `C++ Code:\n${topic.code}\n\n` +
      `Practice Questions:\n${topic.questions.map(
        (question, i) => `${i + 1}. ${question}`
      ).join("\n")}`;
  }
}

function prepareAlgorithmNote(id) {
  if (!auth.currentUser) {
    pendingProtectedPage = "notes";
    openAuth("login");

    setMessage(
      "authMessage",
      "Sign in to save personal notes.",
      "error"
    );
    return;
  }

  const item = algorithmNotes[id];
  if (!item) return;

  goToPage("notes");
  resetNoteForm();

  if ($("noteTitle")) $("noteTitle").value = item.title;
  if ($("noteTopic")) $("noteTopic").value = "Graph Algorithms";

  if ($("noteContent")) {
    $("noteContent").value =
      `${item.definition}\n\n` +
      `Steps:\n${item.steps.map(
        (step, i) => `${i + 1}. ${step}`
      ).join("\n")}\n\n` +
      `Example:\n${item.example}\n\n` +
      `Time Complexity: ${item.complexity}\n` +
      `Space Complexity: ${item.space}\n\n` +
      `Important: ${item.tip}\n\n` +
      `C++ Code:\n${item.code}`;
  }
}


// 14. EVENT LISTENERS
document.addEventListener("click", event => {
  const pageButton = event.target.closest("[data-page]");

  if (pageButton) {
    event.preventDefault();
    goToPage(pageButton.dataset.page);
    return;
  }

  const topicButton = event.target.closest("[data-topic]");

  if (topicButton) {
    showTopic(topicButton.dataset.topic);
    return;
  }

  const saveTopicButton = event.target.closest("[data-save-topic]");

  if (saveTopicButton) {
    prepareTopicNote(saveTopicButton.dataset.saveTopic);
    return;
  }

  const saveAlgorithmButton = event.target.closest("[data-save-algorithm]");

  if (saveAlgorithmButton) {
    prepareAlgorithmNote(saveAlgorithmButton.dataset.saveAlgorithm);
    return;
  }

  const editButton = event.target.closest("[data-edit-note]");

  if (editButton) {
    editNote(editButton.dataset.editNote);
    return;
  }

  const deleteButton = event.target.closest("[data-delete-note]");

  if (deleteButton) {
    deleteNote(deleteButton.dataset.deleteNote);
    return;
  }

  const authModeButton = event.target.closest("[data-auth-mode]");

  if (authModeButton) {
    event.preventDefault();
    openAuth(authModeButton.dataset.authMode);
    return;
  }

  if (event.target.closest("#authButton")) {
    openAuth("login");
    return;
  }

  if (event.target.closest("#logoutButton")) {
    logoutUser();
    return;
  }

  if (
    event.target.closest("#closeAuthButton") ||
    event.target.closest("[data-close-modal]")
  ) {
    closeAuth();
    return;
  }

  if (event.target.closest("#cancelEditButton")) {
    resetNoteForm();
  }
});

$("authForm")?.addEventListener("submit", submitAuth);
$("forgotPasswordButton")?.addEventListener("click", resetPassword);
$("noteForm")?.addEventListener("submit", saveNote);
$("runButton")?.addEventListener("click", startAlgorithm);
$("nextButton")?.addEventListener("click", nextStep);
$("resetButton")?.addEventListener("click", resetAlgorithm);

$("algorithmSelect")?.addEventListener("change", () => {
  if (!auth.currentUser) {
    pendingProtectedPage = "visualizer";
    openAuth("login");
    return;
  }

  resetAlgorithm();
  renderAlgorithmGuide();
});

$("topicSearch")?.addEventListener("input", event => {
  searchTopics(event.target.value);
});

$("authModal")?.addEventListener("click", event => {
  if (event.target.id === "authModal") {
    closeAuth();
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeAuth();
  }
});


// 15. AUTHENTICATION STATE
onAuthStateChanged(auth, async user => {
  currentUser = user;
  updateAccountUI(user);

  if (user) {
    if (pendingProtectedPage) {
      const destination = pendingProtectedPage;
      pendingProtectedPage = null;

      closeAuth();
      goToPage(destination);
    } else if ($("notesPage")?.classList.contains("active")) {
      await loadNotes();
    }
  } else {
    notesCache = [];
    renderNotes();

    if (PROTECTED_PAGES.some(page =>
      $(`${page}Page`)?.classList.contains("active")
    )) {
      goToPage("home");
    }
  }
});


// 16. DARK / LIGHT THEME
function applyTheme(theme) {
  const selectedTheme = theme === "dark" ? "dark" : "light";

  document.body.dataset.theme = selectedTheme;

  const themeButton = $("themeToggle");

  if (themeButton) {
    const darkMode = selectedTheme === "dark";

    themeButton.textContent = darkMode ? "☀️ Light" : "🌙 Dark";

    themeButton.setAttribute(
      "aria-label",
      darkMode ? "Switch to light mode" : "Switch to dark mode"
    );

    themeButton.title = darkMode
      ? "Switch to light mode"
      : "Switch to dark mode";
  }

  try {
    localStorage.setItem("algovista_theme", selectedTheme);
  } catch (error) {
    console.warn("Could not save theme preference.", error);
  }
}

function initializeTheme() {
  let savedTheme = "light";

  try {
    savedTheme = localStorage.getItem("algovista_theme") || "light";
  } catch (error) {
    console.warn("Could not read theme preference.", error);
  }

  applyTheme(savedTheme);

  $("themeToggle")?.addEventListener("click", () => {
    const currentTheme = document.body.dataset.theme || "light";

    applyTheme(currentTheme === "dark" ? "light" : "dark");
  });
}


// 17. START APPLICATION
function startAlgoVista() {
  renderTopics();
  populateNodeSelectors();
  renderGraph();
  renderAlgorithmGuide();
  resetAlgorithm();

  // Always show the public Home page on initial startup.
  goToPage("home");

  console.log("AlgoVista initialized successfully.");
}

initializeTheme();
startAlgoVista();

// Password show/hide buttons
document.addEventListener("click", function (event) {
  const button = event.target.closest(".password-toggle");

  if (!button) return;

  const wrapper = button.closest(".password-wrapper");
  const input = wrapper?.querySelector("input");

  if (!input) return;

  const showingPassword = input.type === "password";

  input.type = showingPassword ? "text" : "password";
  button.textContent = showingPassword ? "🙈" : "👁";
  button.setAttribute(
    "aria-label",
    showingPassword ? "Hide password" : "Show password"
  );
  button.setAttribute("aria-pressed", String(showingPassword));
});

// =========================================================
// PASSWORD SHOW / HIDE — WORKS WITH DYNAMIC LOGIN/SIGNUP FORMS
// =========================================================

document.addEventListener("click", function (event) {
  const toggleButton = event.target.closest(
    "#passwordToggle, #togglePasswordButton, .password-toggle"
  );

  if (!toggleButton) return;

  event.preventDefault();

  // Find the password input associated with this button
  const wrapper = toggleButton.closest(".password-wrapper");

  let passwordInput = wrapper
    ? wrapper.querySelector("input")
    : null;

  // Fallback for forms that use the passwordInput ID
  if (!passwordInput) {
    passwordInput = document.getElementById("passwordInput");
  }

  if (!passwordInput) {
    console.error(
      "AlgoVista: Password input not found. Check the input ID and HTML."
    );
    return;
  }

  // Toggle visibility
  const shouldShowPassword = passwordInput.type === "password";

  passwordInput.type = shouldShowPassword ? "text" : "password";

  // Update button accessibility labels
  toggleButton.setAttribute(
    "aria-label",
    shouldShowPassword ? "Hide password" : "Show password"
  );

  toggleButton.setAttribute(
    "title",
    shouldShowPassword ? "Hide password" : "Show password"
  );

  toggleButton.setAttribute(
    "aria-pressed",
    String(shouldShowPassword)
  );

  // Update the icon if the button uses text icons
  toggleButton.textContent = shouldShowPassword ? "🙈" : "👁️";
});


