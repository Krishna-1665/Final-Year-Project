import csv
import os

input_file = r'C:\Users\hp\Desktop\Final year project\Final-Year-Project\backend\model\dataset_full.csv'
output_file = r'C:\Users\hp\Desktop\Final year project\Final-Year-Project\backend\model\dataset_generated.csv'

# Define custom answers for each question ID.
custom_answers = {
    'q11': {
        '2': "I prioritize tasks by urgency and importance, often using techniques like the Eisenhower Matrix, to ensure critical deadlines are met.",
        '1': "I usually make a to-do list and do the most important things first.",
        '0': "I just do whatever task comes to my mind first."
    },
    'q12': {
        '2': "I once missed a project deadline due to poor estimation. I learned to break tasks into smaller parts and buffer my estimates for unexpected issues.",
        '1': "I made a coding error that broke the build. I learned to be more careful and double-check my work.",
        '0': "I don't really make mistakes at work."
    },
    'q13': {
        '2': "I am adaptable depending on the project. I enjoy team collaboration for brainstorming and design, but I also excel at focused, independent work when coding.",
        '1': "I like working in a team because it's easier to get help.",
        '0': "I prefer working alone because other people slow me down."
    },
    'q14': {
        '2': "Yes, I was wondering what the key priorities are for the person stepping into this role over the first 90 days?",
        '1': "What are the working hours and benefits?",
        '0': "No, I don't have any questions right now."
    },
    'q15': {
        '2': "HTML stands for HyperText Markup Language. It provides the standard logical structure and core content for building web pages.",
        '1': "HTML is the language used to make web pages.",
        '0': "HTML is an operating system for the internet."
    },
    'q16': {
        '2': "CSS (Cascading Style Sheets) is used to style and layout web pages, altering fonts, colors, spacing, and responsive designs separately from the HTML structure.",
        '1': "CSS is used to add colors and make the website look pretty.",
        '0': "CSS is a programming language used for databases."
    },
    'q17': {
        '2': "JavaScript is a versatile programming language primarily used to create interactive and dynamic content on web pages. It is essential for modern web development.",
        '1': "JavaScript is what makes websites interactive and do things when you click.",
        '0': "JavaScript is the same thing as Java but for scripts."
    },
    'q18': {
        '2': "The DOM (Document Object Model) is a programming interface for web documents. It represents the page so that programs can change the document structure, style, and content.",
        '1': "The DOM is the tree of HTML elements on the page.",
        '0': "DOM stands for Document Origin Machine."
    },
    'q19': {
        '2': "Frontend is the user interface and client-side logic that users interact with directly. Backend is the server-side architecture, databases, and application logic that powers the frontend.",
        '1': "Frontend is what you see on the screen, backend is the server and database.",
        '0': "Frontend is easy and backend is hard."
    },
    'q20': {
        '2': "HTTP methods denote actions to be performed on a resource. Common ones include GET (retrieve), POST (create), PUT (update), and DELETE (remove).",
        '1': "HTTP methods are things like GET and POST to send data.",
        '0': "HTTP methods are used to secure websites."
    },
    'q21': {
        '2': "An API (Application Programming Interface) is a set of rules and protocols that allows different software applications to communicate and share data with each other.",
        '1': "An API is a way for apps to to get data from a server.",
        '0': "An API is a type of website program."
    },
    'q22': {
        '2': "JSON (JavaScript Object Notation) is a lightweight data query and interchange format that is easy for humans to read and write, and easy for machines to parse.",
        '1': "JSON is a format to store data in key-value pairs.",
        '0': "JSON is the creator of JavaScript."
    },
    'q23': {
        '2': "Responsive web design is an approach that ensures web pages render well on a variety of devices and window or screen sizes using fluid grids and media queries.",
        '1': "Responsive design means a website works on mobile phones and computers.',",
        '0': "Responsive design means the website loads very fast."
    },
    'q24': {
        '2': "In JavaScript, '==' performs type coercion before checking for equality, while '===' checks for strict equality, meaning both value and type must match exactly.",
        '1': "'==' checks value, and '===' checks value and type.",
        '0': "There is no difference, they both check if things are equal."
    },
    'q25': {
        '2': "A closure is a function that remembers and can access variables from its outer lexical scope even after that outer scope has finished executing.",
        '1': "It’s when a function uses variables from outside its scope.",
        '0': "I don’t know what closure is."
    },
    'q26': {
        '2': "React is a declarative, efficient, and flexible JavaScript library created by Facebook for building dynamic user interfaces using component-based architecture.",
        '1': "React is a framework for building frontend web applications.",
        '0': "React is a database management system."
    },
    'q27': {
        '2': "JSX is a syntax extension for JavaScript used in React. It allows developers to write HTML-like markup directly inside JavaScript files, simplifying component rendering.",
        '1': "JSX is HTML written inside JavaScript for React components.",
        '0': "JSX is a new version of JavaScript."
    },
    'q28': {
        '2': "A component in React is an independent, reusable piece of the UI. Components accept props and return React elements detailing what should appear on the screen.",
        '1': "A component is a part of the website, like a button or a header.",
        '0': "A component is a type of variable."
    },
    'q29': {
        '2': "'Props' are read-only arguments passed to a component, while 'state' is a local, mutable data store managed within the component itself that drives rendering.",
        '1': "Props are passed to components, state is data kept inside the component.",
        '0': "State is what city you live in, props are properties of CSS."
    },
    'q30': {
        '2': "Event bubbling is an event propagation phase in the DOM where an event triggered on an element propagates up the DOM tree from the target element to its ancestors.",
        '1': "It's when an event goes upwards through parent elements in HTML.",
        '0': "Event bubbling means creating a lot of events quickly."
    },
    'q31': {
        '2': "CORS (Cross-Origin Resource Sharing) is a security mechanism that restricts a webpage from making requests to a different domain than the one that served the web page.",
        '1': "CORS is a security feature that stops websites from accessing other website's data.",
        '0': "CORS is an error you get when making APIs."
    },
    'q32': {
        '2': "A RESTful API is an architectural style that uses standard HTTP methods, stateless communication, and URLs to access and manipulate data representations (usually JSON).",
        '1': "It's an API that follows REST rules, using GET, POST, PUT, DELETE.",
        '0': "RESTful API means the API takes rests between requests."
    },
    'q33': {
        '2': "A variable is a named storage location in a program's memory that holds data which can be modified during script execution.",
        '1': "A variable is a container for storing data values.",
        '0': "A variable is a mathematical equation."
    },
    'q34': {
        '2': "Data types define the kind of value a variable can hold, such as integers, strings, booleans, arrays, or objects, dictating how the data is stored and manipulated.",
        '1': "Data types are things like numbers, text, and true/false values.",
        '0': "Data types are how fast data transfers."
    },
    'q35': {
        '2': "A function is a reusable block of code designed to perform a specific task, which executes when called, taking optional inputs and returning optional outputs.",
        '1': "A function is code that you write once and run many times.",
        '0': "A function is a hardware piece in a computer."
    },
    'q36': {
        '2': "OOP is a programming paradigm based on the concept of 'objects', which contain data fields (attributes) and methods, focusing on structure rather than pure logic.",
        '1': "OOP is programming using classes and objects.",
        '0': "OOP is when things go wrong in your code."
    },
    'q37': {
        '2': "The four pillars of OOP are encapsulation (hiding state), abstraction (hiding implementation), inheritance (reusing code), and polymorphism (multiple forms of interfaces).",
        '1': "They are encapsulation, inheritance, polymorphism, and abstraction.",
        '0': "Variables, functions, arrays, and loops."
    },
    'q38': {
        '2': "Inheritance in OOP allows a new class to inherit properties and methods from an existing, parent class, promoting code reusability and hierarchical structure.",
        '1': "Inheritance is when one class gets the features of another class.",
        '0': "Inheritance is getting money from a relative."
    },
    'q39': {
        '2': "Polymorphism allows objects of different classes to be treated as instances of the same superclass, typically utilizing method overriding or overloading.",
        '1': "It means many forms, letting different things use the same function names.",
        '0': "Polymorphism is drawing many shapes."
    },
    'q40': {
        '2': "Encapsulation is the bundling of data and the methods that operate on that data into a single unit (class), restricting direct access to some of the object's components.",
        '1': "Encapsulation hides the data inside a class so outside code can't change it.",
        '0': "It means putting things in a capsule."
    },
    'q41': {
        '2': "Abstraction involves hiding complex implementation details of a system and only exposing the essential features to the user, reducing complexity.",
        '1': "Abstraction means hiding how things work and only showing what they do.",
        '0': "Abstraction means making abstract art using code."
    },
    'q42': {
        '2': "Recursion is a technique where a function calls itself directly or indirectly to solve a smaller instance of the same problem, requiring a base case to terminate.",
        '1': "Recursion is a function calling itself over and over.",
        '0': "Recursion means bolding text."
    },
    'q43': {
        '2': "An algorithm is a finite, step-by-step sequence of unambiguous instructions used to solve a specific problem or perform a computation.",
        '1': "An algorithm is a set of rules to solve a problem.",
        '0': "Algorithms are magic computer brains."
    },
    'q44': {
        '2': "Time complexity, often expressed in Big O notation, quantifies the amount of time an algorithm takes to run as a function of the length of the input.",
        '1': "Time complexity describes how fast an algorithm runs based on input size.",
        '0': "Time complexity tells you what time it is."
    },
    'q45': {
        '2': "A loop is a control flow statement that allows a block of code to be executed repeatedly based on a given boolean condition.",
        '1': "A loop repeats code multiple times until a condition is met.",
        '0': "A loop is a circle of wire."
    },
    'q46': {
        '2': "An array is a data structure consisting of a collection of elements, each identified by an array index or key, stored in contiguous memory locations.",
        '1': "An array is a list of items stored in variables.",
        '0': "An array is a ray of sunshine."
    },
    'q47': {
        '2': "A stack is a linear data structure that follows the Last-In-First-Out (LIFO) principle, where elements are added and removed from the same end, called the top.",
        '1': "A stack is a data structure where the last item added is the first one taken out.",
        '0': "A stack is a pile of books."
    },
    'q48': {
        '2': "A queue is a linear data structure operating on the First-In-First-Out (FIFO) principle, meaning the first element added will be the first one removed.",
        '1': "A queue is like a line of people, first in is first out.",
        '0': "A queue is a letter in the alphabet."
    },
    'q49': {
        '2': "A hash table is a data structure that maps keys to values using a hash function, allowing for highly efficient insertion, deletion, and lookup operations.",
        '1': "A hash table stores key-value pairs using hashes for fast lookups.",
        '0': "A hash table is a table made of hash browns."
    },
    'q50': {
        '2': "Exception handling is a mechanism to gracefully manage runtime errors, allowing the program to respond to anomalies and maintain normal execution flow without crashing.",
        '1': "It is using try-catch blocks to handle errors so the app doesn't close.",
        '0': "It means making exceptions when writing code."
    },
    'q51': {
        '2': "A database is a securely structured and organized collection of data, designed to allow easy data retrieval, manipulation, management, and long-term persistence.",
        '1': "A database is a place where apps store all their data.",
        '0': "A database is a computer base of operations."
    },
    'q52': {
        '2': "SQL (Structured Query Language) is the standard declarative domain-specific language used for managing, querying, and manipulating relational databases.",
        '1': "SQL is the code you use to talk to databases and get data.",
        '0': "SQL means Sequel to a movie."
    },
    'q53': {
        '2': "NoSQL databases store unstructured or semi-structured data in non-tabular formats like document, key-value, or graph networks, providing flexible schemas compared to SQL.",
        '1': "NoSQL stores data in documents instead of tables like SQL does.",
        '0': "NoSQL means having zero SQL skills."
    },
    'q54': {
        '2': "A primary key is a unique identifier constraint for a specific record in a database table, ensuring no duplicate or null values exist in that specific column.",
        '1': "A primary key gives a unique ID to every row in a table.",
        '0': "A primary key is the key to start the server."
    },
    'q55': {
        '2': "A foreign key is a relational constraint attribute in a table that links to the primary key of another table, ensuring referential integrity between the two sets of data.",
        '1': "A foreign key is a column that links one table to another table.",
        '0': "A foreign key is used in other countries."
    },
    'q56': {
        '2': "Normalization is the process of structuring a relational database to minimize data redundancy and improve data integrity, usually achieved by dividing larger tables.",
        '1': "Normalization means removing duplicate data from a database.",
        '0': "Normalization is making things normal."
    },
    'q57': {
        '2': "CRUD represents the four foundational data management models for persistent storage: Create (insert), Read (select), Update (modify), and Delete (remove).",
        '1': "CRUD stands for Create, Read, Update, Delete.",
        '0': "CRUD is dirt or grime."
    },
    'q58': {
        '2': "Indexing is a data structure technique used heavily in databases to dramatically speed up the data retrieval processes on specific columns, at the cost of additional storage space.",
        '1': "Indexing makes searching the database much faster.",
        '0': "Indexing is picking items out of a box."
    },
    'q59': {
        '2': "ACID (Atomicity, Consistency, Isolation, Durability) is a set of transaction properties that guarantee database transactions are processed reliably and without error.",
        '1': "ACID is a set of rules ensuring database transactions are safe.",
        '0': "ACID is a dangerous chemical."
    },
    'q60': {
        '2': "A transaction is a logical, atomic unit of database operations that must all succeed or all fail together reliably to maintain database integrity.",
        '1': "A transaction is a sequence of SQL queries run as a single process.",
        '0': "A transaction is buying something online."
    },
    'q61': {
        '2': "Artificial Intelligence is a field of computer science dedicated to creating systems capable of performing tasks that typically require human intelligence, like reasoning and learning.",
        '1': "AI is when computers can think and act like humans.",
        '0': "AI is robots taking over the world."
    },
    'q62': {
        '2': "Machine learning is a subset of AI focusing on the use of data and algorithms to continuously train artificial models, improving their performance on specific tasks.",
        '1': "Machine learning is algorithms that learn from data.",
        '0': "Machine learning is when a laptop goes to school."
    },
    'q63': {
        '2': "Supervised learning is an ML approach where models are trained on distinct labeled datasets (where the desired output is known) to learn continuous patterns or classifications.",
        '1': "Supervised learning is training an AI with data that already has the answers.",
        '0': "It means an adult watches over you while you learn."
    },
    'q64': {
        '2': "Unsupervised learning is a type of machine learning that analyzes and clusters unlabelled datasets to discover hidden patterns or groupings without human intervention.",
        '1': "It’s when AI finds patterns in data that isn't labeled.",
        '0': "Unsupervised means studying without a teacher."
    },
    'q65': {
        '2': "Overfitting happens when a statistical model learns historical training data too precisely, capturing noise and rendering it inaccurate against new, unseen data points.",
        '1': "Overfitting is when an AI memorizes the training data but fails on new data.",
        '0': "Overfitting is wearing clothes that are too tight."
    },
    'q66': {
        '2': "Underfitting occurs when an algorithm cannot adequately capture the underlying structure or complexity of the data, performing poorly on both training and generalized data.",
        '1': "Underfitting is when the model is too simple and makes bad predictions.",
        '0': "Underfitting is when there's extra room in a box."
    },
    'q67': {
        '2': "A dataset is an organized collection of structured or unstructured data, essentially serving as experiences that a machine learning model utilizes to derive its intelligence.",
        '1': "A dataset is a large group of data used to train AI models.",
        '0': "A dataset is a setting on a device."
    },
    'q68': {
        '2': "Feature engineering is the process of using domain knowledge to select, manipulate, and transform raw data attributes into features to improve the performance of predictive models.",
        '1': "Feature engineering is preparing and formatting data to make the AI work better.",
        '0': "Feature engineering is building features on an app."
    },
    'q69': {
        '2': "A model is an artifact created computationally by algorithms training on complex datasets; it is designed to recognize patterns, make predictions, and generate new outputs.",
        '1': "A model is the AI program created after training with a dataset.",
        '0': "A model is a person walking down a runway."
    },
    'q70': {
        '2': "Cross-validation is a solid resampling procedure used inherently to evaluate machine learning models on limited data samples, mitigating overfitting and ensuring accurate metrics.",
        '1': "It is a technique to test an AI by splitting the data into different training and testing groups.",
        '0': "Cross-validation is a cross-shaped validation stamp."
    }
}

try:
    with open(input_file, mode='r', encoding='utf-8') as infile:
        reader = csv.DictReader(infile)
        fieldnames = reader.fieldnames
        rows = list(reader)

    # Process rows
    for row in rows:
        q_id = row['question_id']
        score = row['score']
        
        # If it's one of the questions we defined custom replacements for
        if q_id in custom_answers:
            if score in custom_answers[q_id]:
                row['answer'] = custom_answers[q_id][score]

    with open(output_file, mode='w', encoding='utf-8', newline='') as outfile:
        writer = csv.DictWriter(outfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Generated successfully to {output_file}")
except Exception as e:
    print(f"Error: {e}")
