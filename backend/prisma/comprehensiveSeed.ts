import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to create article markdown
function createArticleMarkdown(title: string, sections: Array<{ heading: string; content: string }>): string {
  let markdown = `# ${title}\n\n`;
  sections.forEach(section => {
    markdown += `## ${section.heading}\n\n${section.content}\n\n`;
  });
  return markdown;
}

// Determine visualization type based on concept
function determineVisualizationType(conceptData: any): string | null {
  const slug = conceptData.slug.toLowerCase();
  const title = conceptData.title.toLowerCase();
  
  // Array-related
  if (slug.includes('array') || title.includes('array')) {
    return 'array';
  }
  
  // Sorting algorithms
  if (slug.includes('sort') || title.includes('sort')) {
    return 'array'; // Sorting visualizations use array visualizer
  }
  
  // Linked lists
  if (slug.includes('linked-list') || title.includes('linked list')) {
    return 'array'; // Can use array visualizer for linked lists
  }
  
  // Stacks
  if (slug.includes('stack') || title.includes('stack')) {
    return 'stack';
  }
  
  // Queues
  if (slug.includes('queue') || title.includes('queue')) {
    return 'queue';
  }
  
  // Trees
  if (slug.includes('tree') || title.includes('tree') || slug.includes('bst') || title.includes('binary search')) {
    return 'tree';
  }
  
  // Graphs
  if (slug.includes('graph') || title.includes('graph') || slug.includes('dijkstra') || slug.includes('bfs') || slug.includes('dfs')) {
    return 'graph';
  }
  
  // Heaps
  if (slug.includes('heap') || title.includes('heap')) {
    return 'tree'; // Heaps are visualized as trees
  }
  
  // Hash tables - could use array visualization
  if (slug.includes('hash') || title.includes('hash')) {
    return 'array';
  }
  
  return null;
}

// Get visualization config based on type
function getVisualizationConfig(vizType: string, conceptData: any): any {
  switch (vizType) {
    case 'array':
      // Default array data
      return {
        data: [64, 34, 25, 12, 22, 11, 90],
        highlightIndex: -1,
        showControls: false,
      };
    
    case 'stack':
      return {
        items: [10, 20, 30],
        showControls: false,
      };
    
    case 'queue':
      return {
        items: [10, 20, 30],
        showControls: false,
      };
    
    case 'tree':
      // Default binary tree
      return {
        root: {
          value: 10,
          left: {
            value: 5,
            left: { value: 3, left: null, right: null },
            right: { value: 7, left: null, right: null },
          },
          right: {
            value: 15,
            left: { value: 12, left: null, right: null },
            right: { value: 18, left: null, right: null },
          },
        },
      };
    
    case 'graph':
      // Default graph
      return {
        nodes: [
          { id: '0', label: 'A', x: 100, y: 100 },
          { id: '1', label: 'B', x: 200, y: 100 },
          { id: '2', label: 'C', x: 150, y: 200 },
        ],
        edges: [
          { source: '0', target: '1' },
          { source: '1', target: '2' },
          { source: '2', target: '0' },
        ],
      };
    
    default:
      return {};
  }
}

async function main() {
  console.log('🌱 Starting comprehensive database seeding...\n');
  
  // Clear existing data
  await prisma.concept.deleteMany({});
  
  const conceptMap = new Map<string, string>();
  
  // Define comprehensive curriculum
  const concepts = [
    // C++ Basics
    {
      title: 'C++ Programming Fundamentals',
      slug: 'cpp-basics',
      description: 'Master C++ from basics: syntax, data types, control flow, functions, pointers, memory management',
      difficulty: 'beginner',
      order: 1,
      article: {
        sections: [
          {
            heading: 'Introduction to C++',
            content: `C++ is a powerful, general-purpose programming language developed by Bjarne Stroustrup. It combines high-level and low-level programming features.

**Why Learn C++?**
- High performance and system-level programming
- Direct memory management
- Object-oriented and procedural paradigms
- Widely used in game development, operating systems, and embedded systems

**Hello World:**

\`\`\`cpp
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}
\`\`\`

**Key Features:**
- Compiled language (fast execution)
- Strong typing
- Multiple programming paradigms
- Rich standard library`
          },
          {
            heading: 'Data Types and Variables',
            content: `**Fundamental Data Types:**

\`\`\`cpp
// Integer types
int age = 25;              // 4 bytes, range: -2^31 to 2^31-1
short small = 100;         // 2 bytes, range: -2^15 to 2^15-1
long big = 1000000;        // 4-8 bytes (platform dependent)
long long huge = 1e18;     // 8 bytes, range: -2^63 to 2^63-1

// Floating point types
float price = 99.99f;       // 4 bytes, ~7 decimal digits
double precise = 99.999;    // 8 bytes, ~15 decimal digits
long double veryPrecise;   // 12-16 bytes, extended precision

// Character and boolean
char grade = 'A';          // 1 byte, ASCII character
bool isActive = true;      // 1 byte, true/false

// Size demonstration
cout << "Size of int: " << sizeof(int) << " bytes" << endl;
cout << "Size of double: " << sizeof(double) << " bytes" << endl;
\`\`\`

**Type Modifiers:**

\`\`\`cpp
signed int negative = -10;   // Can be negative (default for int)
unsigned int positive = 10;  // Only non-negative values (0 to 2^32-1)
const int MAX_SIZE = 100;    // Constant, cannot be modified
volatile int sensor;         // May change unexpectedly (hardware registers)
\`\`\`

**Variable Declaration and Initialization:**

\`\`\`cpp
int x;           // Declaration (uninitialized, contains garbage)
int y = 10;      // Declaration and initialization
int z{20};       // Uniform initialization (C++11, preferred)
int w(30);       // Constructor initialization

// Multiple variables
int a = 1, b = 2, c = 3;
\`\`\``
          },
          {
            heading: 'Control Flow',
            content: `**If-Else Statements:**

\`\`\`cpp
int score = 85;
char grade;

if (score >= 90) {
    grade = 'A';
} else if (score >= 80) {
    grade = 'B';
} else if (score >= 70) {
    grade = 'C';
} else {
    grade = 'F';
}

// Ternary operator
grade = (score >= 60) ? 'P' : 'F';
\`\`\`

**Switch Statement:**

\`\`\`cpp
int day = 3;

switch (day) {
    case 1:
        cout << "Monday" << endl;
        break;
    case 2:
        cout << "Tuesday" << endl;
        break;
    case 3:
        cout << "Wednesday" << endl;
        break;
    default:
        cout << "Invalid day" << endl;
}

// Switch with fall-through
switch (day) {
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
        cout << "Weekday" << endl;
        break;
    case 6:
    case 7:
        cout << "Weekend" << endl;
        break;
}
\`\`\`

**Loops:**

\`\`\`cpp
// For loop
for (int i = 0; i < 5; i++) {
    cout << i << " ";
}
// Output: 0 1 2 3 4

// While loop
int count = 0;
while (count < 5) {
    cout << count << " ";
    count++;
}

// Do-while loop (executes at least once)
int num = 0;
do {
    cout << num << " ";
    num++;
} while (num < 5);

// Range-based for loop (C++11)
int arr[] = {1, 2, 3, 4, 5};
for (int element : arr) {
    cout << element << " ";
}

// Range-based with reference (for modification)
for (int& element : arr) {
    element *= 2;  // Modifies original array
}

// Loop control
for (int i = 0; i < 10; i++) {
    if (i == 3) continue;  // Skip iteration
    if (i == 7) break;     // Exit loop
    cout << i << " ";
}
\`\`\``
          },
          {
            heading: 'Functions',
            content: `**Function Basics:**

\`\`\`cpp
// Function declaration (prototype)
int add(int a, int b);

// Function definition
int add(int a, int b) {
    return a + b;
}

// Function call
int result = add(5, 3);  // result = 8
\`\`\`

**Function Overloading:**

\`\`\`cpp
// Same function name, different parameters
int add(int a, int b) {
    return a + b;
}

double add(double a, double b) {
    return a + b;
}

int add(int a, int b, int c) {
    return a + b + c;
}

// Usage
cout << add(5, 3) << endl;        // Calls int version
cout << add(5.5, 3.2) << endl;     // Calls double version
cout << add(1, 2, 3) << endl;      // Calls three-parameter version
\`\`\`

**Default Parameters:**

\`\`\`cpp
void greet(string name = "Guest", int times = 1) {
    for (int i = 0; i < times; i++) {
        cout << "Hello, " << name << "!" << endl;
    }
}

greet();              // "Hello, Guest!"
greet("John");        // "Hello, John!"
greet("Alice", 3);    // "Hello, Alice!" (3 times)
\`\`\`

**Pass by Value vs Reference:**

\`\`\`cpp
// Pass by value (creates copy)
void incrementByValue(int x) {
    x++;  // Only modifies copy
}

// Pass by reference (modifies original)
void incrementByReference(int& x) {
    x++;  // Modifies original variable
}

// Pass by pointer
void incrementByPointer(int* x) {
    (*x)++;  // Modifies original variable
}

int main() {
    int num = 5;
    
    incrementByValue(num);
    cout << num << endl;  // Still 5
    
    incrementByReference(num);
    cout << num << endl;  // Now 6
    
    incrementByPointer(&num);
    cout << num << endl;  // Now 7
    
    return 0;
}
\`\`\`

**Inline Functions:**

\`\`\`cpp
// Inline function (suggested to compiler)
inline int square(int x) {
    return x * x;
}

// Used for small, frequently called functions
// Compiler may replace function call with function body
\`\`\``
          },
          {
            heading: 'Pointers and References',
            content: `**Pointers:**

\`\`\`cpp
int value = 42;
int* ptr = &value;  // Pointer stores address of value

cout << "Value: " << value << endl;       // 42
cout << "Address: " << ptr << endl;        // Memory address (e.g., 0x7fff...)
cout << "Dereferenced: " << *ptr << endl;  // 42 (value at address)

// Pointer arithmetic
int arr[] = {10, 20, 30, 40, 50};
int* p = arr;
cout << *p << endl;      // 10 (first element)
cout << *(p + 1) << endl; // 20 (second element)
cout << *(p + 2) << endl; // 30 (third element)

// Pointer to pointer
int** pp = &ptr;
cout << **pp << endl;  // 42 (value through double pointer)
\`\`\`

**References:**

\`\`\`cpp
int value = 42;
int& ref = value;  // Reference is alias for value

ref = 100;  // Modifies value
cout << value << endl;  // 100
cout << ref << endl;    // 100

// Reference vs pointer
int* ptr = &value;      // Pointer can be reassigned
int& ref2 = value;      // Reference cannot be reassigned
// ref2 = anotherVar;   // This would assign value, not change reference
\`\`\`

**When to Use What:**
- **Pointers**: When you need to reassign or when nullptr is needed
- **References**: When you want guaranteed non-null alias
- **Pass by reference**: For large objects (avoid copying)
- **Pass by pointer**: When null is a valid state`
          },
          {
            heading: 'Memory Management',
            content: `**Dynamic Memory Allocation:**

\`\`\`cpp
// Allocate single variable
int* ptr = new int(42);
*ptr = 100;
delete ptr;  // IMPORTANT: Free memory
ptr = nullptr;  // Good practice

// Allocate array
int* arr = new int[10];
for (int i = 0; i < 10; i++) {
    arr[i] = i * 2;
}
delete[] arr;  // Use delete[] for arrays
arr = nullptr;

// Common mistake: Memory leak
int* leak = new int(42);
// Forgot to delete - memory leak!
\`\`\`

**Smart Pointers (C++11):**

\`\`\`cpp
#include <memory>

// Unique pointer (exclusive ownership)
unique_ptr<int> uptr = make_unique<int>(42);
// Automatically deleted when out of scope
// Cannot be copied, only moved

// Shared pointer (shared ownership)
shared_ptr<int> sptr = make_shared<int>(42);
auto sptr2 = sptr;  // Both share ownership
// Automatically deleted when last shared_ptr is destroyed

// Weak pointer (non-owning reference)
weak_ptr<int> wptr = sptr;
// Doesn't affect reference count
// Use lock() to access: auto temp = wptr.lock();
\`\`\`

**Best Practices:**
1. Always delete what you new
2. Use smart pointers instead of raw pointers
3. Set pointer to nullptr after delete
4. Use delete[] for arrays
5. Check for nullptr before dereferencing`
          }
        ]
      },
      faqs: [
        {
          question: 'What is the difference between declaration and definition?',
          answer: 'Declaration introduces a name and its type, while definition provides the actual implementation. A function can be declared multiple times but defined only once.'
        },
        {
          question: 'When should I use pointers vs references?',
          answer: 'Use pointers when you need to reassign or when nullptr is a valid state. Use references when you want a guaranteed non-null alias and don\'t need reassignment.'
        },
        {
          question: 'What is a memory leak?',
          answer: 'A memory leak occurs when dynamically allocated memory is not deallocated. This causes the program to consume more and more memory over time.'
        }
      ],
      practiceProblems: [
        {
          title: 'Calculate Factorial',
          description: 'Write a function to calculate factorial of a number using recursion and iteration.',
          difficulty: 'easy',
          examples: [
            { input: '5', output: '120' },
            { input: '0', output: '1' }
          ],
          hints: [
            'Factorial of n is n * (n-1) * ... * 1',
            'Base case: factorial(0) = 1',
            'Use recursion or iterative loop'
          ],
          solution: `// Recursive
int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

// Iterative
int factorialIter(int n) {
    int result = 1;
    for (int i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}`,
          testCases: [
            { input: '5', expectedOutput: '120' },
            { input: '0', expectedOutput: '1' },
            { input: '1', expectedOutput: '1' },
            { input: '10', expectedOutput: '3628800' }
          ]
        }
      ]
    },
    // Python Basics
    {
      title: 'Python Programming Fundamentals',
      slug: 'python-basics',
      description: 'Master Python from basics: syntax, data types, control flow, functions, and data structures',
      difficulty: 'beginner',
      order: 2,
      article: {
        sections: [
          {
            heading: 'Introduction to Python',
            content: `Python is a high-level, interpreted programming language known for its simplicity and readability.

**Why Learn Python?**
- Easy to learn and read
- Versatile (web, data science, AI, automation)
- Large ecosystem of libraries
- High demand in industry

**Hello World:**

\`\`\`python
print("Hello, World!")
\`\`\`

**Key Features:**
- Dynamically typed
- Interpreted language
- Indentation-based syntax
- Rich standard library`
          },
          {
            heading: 'Data Types',
            content: `**Fundamental Types:**

\`\`\`python
# Numeric types
integer = 42
float_num = 3.14
complex_num = 3 + 4j

# String
name = "Python"
message = 'Hello, World!'
multiline = """This is
a multiline string"""

# Boolean
is_active = True
is_complete = False

# None type
value = None

# Type checking
print(type(integer))    # <class 'int'>
print(type(float_num))  # <class 'float'>
print(type(name))       # <class 'str'>
\`\`\`

**Type Conversion:**

\`\`\`python
# Explicit conversion
num_str = "42"
num_int = int(num_str)
num_float = float(num_str)

# Implicit conversion
result = 5 + 3.14  # int + float = float
\`\`\``
          },
          {
            heading: 'Control Flow',
            content: `**If-Elif-Else:**

\`\`\`python
score = 85

if score >= 90:
    grade = 'A'
elif score >= 80:
    grade = 'B'
elif score >= 70:
    grade = 'C'
else:
    grade = 'F'
\`\`\`

**Loops:**

\`\`\`python
# For loop
for i in range(5):
    print(i)  # 0, 1, 2, 3, 4

# While loop
count = 0
while count < 5:
    print(count)
    count += 1

# For with iterable
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(fruit)

# With index
for index, fruit in enumerate(fruits):
    print(f"{index}: {fruit}")
\`\`\``
          },
          {
            heading: 'Functions',
            content: `**Function Definition:**

\`\`\`python
def greet(name):
    """Function to greet a person"""
    return f"Hello, {name}!"

result = greet("John")
\`\`\`

**Advanced Features:**

\`\`\`python
# Default parameters
def greet(name="Guest"):
    return f"Hello, {name}!"

# Variable arguments
def sum_all(*args):
    return sum(args)

def print_info(**kwargs):
    for key, value in kwargs.items():
        print(f"{key}: {value}")

# Lambda functions
square = lambda x: x ** 2
numbers = [1, 2, 3, 4, 5]
squared = list(map(lambda x: x**2, numbers))
\`\`\``
          }
        ]
      },
      faqs: [
        {
          question: 'What is the difference between lists and tuples?',
          answer: 'Lists are mutable (can be modified) while tuples are immutable (cannot be modified after creation). Lists use square brackets [], tuples use parentheses ().'
        }
      ]
    },
    // Arrays Basic
    {
      title: 'Arrays - Fundamentals',
      slug: 'arrays-fundamentals',
      description: 'Learn arrays from basics: declaration, initialization, access, and basic operations',
      difficulty: 'beginner',
      order: 10,
      article: {
        sections: [
          {
            heading: 'Introduction to Arrays',
            content: `An array is a collection of elements of the same data type stored in contiguous memory locations.

**Key Characteristics:**
- Fixed size (in C++)
- Indexed access (0-based)
- Contiguous memory
- Homogeneous elements

**Time Complexities:**
- Access: O(1)
- Search: O(n)
- Insertion: O(n)
- Deletion: O(n)`
          },
          {
            heading: 'C++ Arrays',
            content: `**Declaration and Initialization:**

\`\`\`cpp
// Declaration
int arr[5];

// Initialization
int arr1[5] = {1, 2, 3, 4, 5};
int arr2[] = {1, 2, 3};  // Size inferred
int arr3[5] = {1, 2};    // Rest initialized to 0

// Access
cout << arr1[0] << endl;  // First element
cout << arr1[4] << endl;  // Last element

// Size
int size = sizeof(arr1) / sizeof(arr1[0]);
\`\`\`

**Traversal:**

\`\`\`cpp
int arr[] = {10, 20, 30, 40, 50};
int n = sizeof(arr) / sizeof(arr[0]);

// Forward
for (int i = 0; i < n; i++) {
    cout << arr[i] << " ";
}

// Range-based (C++11)
for (int element : arr) {
    cout << element << " ";
}
\`\`\``
          },
          {
            heading: 'Python Lists',
            content: `**List Operations:**

\`\`\`python
# Create
arr = [1, 2, 3, 4, 5]

# Access
print(arr[0])      # First
print(arr[-1])     # Last
print(arr[1:4])    # Slice: [2, 3, 4]

# Modify
arr[0] = 10
arr.append(6)
arr.insert(2, 99)
arr.remove(3)
arr.pop()
arr.sort()
arr.reverse()

# List comprehension
squares = [x**2 for x in range(10)]
evens = [x for x in range(20) if x % 2 == 0]
\`\`\``
          }
        ]
      },
      practiceProblems: [
        {
          title: 'Find Maximum Element',
          description: 'Write a function to find the maximum element in an array.',
          difficulty: 'easy',
          examples: [
            { input: '[3, 7, 2, 9, 1]', output: '9' },
            { input: '[-1, -5, -3]', output: '-1' }
          ],
          hints: [
            'Initialize with first element',
            'Compare with all other elements',
            'Update if you find a larger value'
          ],
          solution: `# Python
def find_max(arr):
    if not arr:
        return None
    max_val = arr[0]
    for num in arr:
        if num > max_val:
            max_val = num
    return max_val

# C++
int findMax(int arr[], int n) {
    if (n == 0) return INT_MIN;
    int max = arr[0];
    for (int i = 1; i < n; i++) {
        if (arr[i] > max) {
            max = arr[i];
        }
    }
    return max;
}`,
          testCases: [
            { input: '[3, 7, 2, 9, 1]', expectedOutput: '9' },
            { input: '[-1, -5, -3]', expectedOutput: '-1' },
            { input: '[5]', expectedOutput: '5' }
          ]
        },
        {
          title: 'Reverse an Array',
          description: 'Write a function to reverse an array in-place.',
          difficulty: 'easy',
          examples: [
            { input: '[1, 2, 3, 4]', output: '[4, 3, 2, 1]' },
            { input: '[5, 10, 15]', output: '[15, 10, 5]' }
          ],
          hints: [
            'Use two pointers',
            'Swap elements from both ends',
            'Continue until pointers meet'
          ],
          solution: `# Python
def reverse_array(arr):
    left, right = 0, len(arr) - 1
    while left < right:
        arr[left], arr[right] = arr[right], arr[left]
        left += 1
        right -= 1
    return arr

# C++
void reverseArray(int arr[], int n) {
    int start = 0, end = n - 1;
    while (start < end) {
        swap(arr[start], arr[end]);
        start++;
        end--;
    }
}`,
          testCases: [
            { input: '[1, 2, 3, 4]', expectedOutput: '[4, 3, 2, 1]' },
            { input: '[5, 10, 15]', expectedOutput: '[15, 10, 5]' }
          ]
        }
      ]
    },
    // Arrays Intermediate
    {
      title: 'Arrays - Intermediate',
      slug: 'arrays-intermediate',
      description: 'Advanced array operations: searching, sorting basics, two-pointer technique, sliding window',
      difficulty: 'intermediate',
      order: 11,
      parentSlug: 'arrays-fundamentals',
      article: {
        sections: [
          {
            heading: 'Searching Algorithms',
            content: `**Linear Search:**

\`\`\`cpp
int linearSearch(int arr[], int n, int target) {
    for (int i = 0; i < n; i++) {
        if (arr[i] == target) return i;
    }
    return -1;
}
\`\`\`

**Binary Search (sorted arrays):**

\`\`\`cpp
int binarySearch(int arr[], int n, int target) {
    int left = 0, right = n - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}
\`\`\`

\`\`\`python
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
\`\`\``
          },
          {
            heading: 'Two-Pointer Technique',
            content: `**Finding Pair Sum:**

\`\`\`cpp
bool twoSum(int arr[], int n, int target) {
    sort(arr, arr + n);
    int left = 0, right = n - 1;
    while (left < right) {
        int sum = arr[left] + arr[right];
        if (sum == target) return true;
        if (sum < target) left++;
        else right--;
    }
    return false;
}
\`\`\`

**Removing Duplicates:**

\`\`\`cpp
int removeDuplicates(int arr[], int n) {
    if (n == 0) return 0;
    int j = 0;
    for (int i = 1; i < n; i++) {
        if (arr[i] != arr[j]) {
            arr[++j] = arr[i];
        }
    }
    return j + 1;
}
\`\`\``
          }
        ]
      }
    },
    // Arrays Advanced
    {
      title: 'Arrays - Advanced',
      slug: 'arrays-advanced',
      description: 'Advanced array techniques: dynamic programming, Kadane algorithm, subarray problems',
      difficulty: 'advanced',
      order: 12,
      parentSlug: 'arrays-fundamentals',
      article: {
        sections: [
          {
            heading: 'Kadane Algorithm',
            content: `**Maximum Subarray Sum:**

\`\`\`cpp
int maxSubarraySum(int arr[], int n) {
    int maxSoFar = arr[0];
    int maxEndingHere = arr[0];
    for (int i = 1; i < n; i++) {
        maxEndingHere = max(arr[i], maxEndingHere + arr[i]);
        maxSoFar = max(maxSoFar, maxEndingHere);
    }
    return maxSoFar;
}
\`\`\`

\`\`\`python
def max_subarray_sum(arr):
    max_so_far = max_ending_here = arr[0]
    for i in range(1, len(arr)):
        max_ending_here = max(arr[i], max_ending_here + arr[i])
        max_so_far = max(max_so_far, max_ending_here)
    return max_so_far
\`\`\``
          }
        ]
      }
    },
    // ============================================
    // SORTING ALGORITHMS
    // ============================================
    {
      title: 'Bubble Sort',
      slug: 'bubble-sort',
      description: 'Learn bubble sort: simple comparison-based sorting algorithm with O(n²) time complexity',
      difficulty: 'beginner',
      order: 100,
      article: {
        sections: [
          {
            heading: 'Introduction to Bubble Sort',
            content: `Bubble Sort is a simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.

**Time Complexity:**
- Best Case: O(n) - when array is already sorted
- Average Case: O(n²)
- Worst Case: O(n²)

**Space Complexity:** O(1) - in-place sorting

**Algorithm Steps:**
1. Compare adjacent elements
2. Swap if they are in wrong order
3. Repeat for all elements
4. Continue until no swaps are needed`
          },
          {
            heading: 'Implementation',
            content: `**C++ Implementation:**

\`\`\`cpp
void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        bool swapped = false;
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
                swapped = true;
            }
        }
        // Optimization: if no swap, array is sorted
        if (!swapped) break;
    }
}
\`\`\`

**Python Implementation:**

\`\`\`python
def bubble_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        swapped = False
        for j in range(n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            break
    return arr
\`\`\`

**Visualization:**
- First pass: Largest element bubbles to the end
- Second pass: Second largest bubbles to second-to-last position
- Continue until sorted`
          },
          {
            heading: 'When to Use',
            content: `**Advantages:**
- Simple to understand and implement
- In-place sorting (O(1) extra space)
- Stable sorting algorithm

**Disadvantages:**
- Very slow for large datasets
- O(n²) time complexity
- Many unnecessary comparisons

**Use Cases:**
- Educational purposes
- Small datasets
- Nearly sorted data
- When simplicity is more important than performance`
          }
        ]
      },
      practiceProblems: [
        {
          title: 'Implement Bubble Sort',
          description: 'Implement bubble sort algorithm and sort the given array.',
          difficulty: 'easy',
          examples: [
            { input: '[64, 34, 25, 12, 22, 11, 90]', output: '[11, 12, 22, 25, 34, 64, 90]' }
          ],
          hints: [
            'Use nested loops',
            'Compare adjacent elements',
            'Swap if out of order',
            'Add optimization to break early if no swaps'
          ],
          solution: `# Python
def bubble_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        swapped = False
        for j in range(n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            break
    return arr`,
          testCases: [
            { input: '[64, 34, 25, 12, 22, 11, 90]', expectedOutput: '[11, 12, 22, 25, 34, 64, 90]' },
            { input: '[5, 2, 8, 1, 9]', expectedOutput: '[1, 2, 5, 8, 9]' }
          ]
        }
      ]
    },
    {
      title: 'Selection Sort',
      slug: 'selection-sort',
      description: 'Learn selection sort: find minimum element and place it at the beginning',
      difficulty: 'beginner',
      order: 101,
      article: {
        sections: [
          {
            heading: 'Introduction to Selection Sort',
            content: `Selection Sort divides the array into sorted and unsorted parts. It repeatedly finds the minimum element from the unsorted part and places it at the beginning.

**Time Complexity:** O(n²) in all cases
**Space Complexity:** O(1)

**Algorithm Steps:**
1. Find minimum element in unsorted array
2. Swap with first element of unsorted part
3. Move boundary of sorted part one position right
4. Repeat until array is sorted`
          },
          {
            heading: 'Implementation',
            content: `**C++ Implementation:**

\`\`\`cpp
void selectionSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }
        swap(arr[i], arr[minIdx]);
    }
}
\`\`\`

**Python Implementation:**

\`\`\`python
def selection_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr
\`\`\``
          }
        ]
      }
    },
    {
      title: 'Insertion Sort',
      slug: 'insertion-sort',
      description: 'Learn insertion sort: efficient for small datasets and nearly sorted arrays',
      difficulty: 'beginner',
      order: 102,
      article: {
        sections: [
          {
            heading: 'Introduction to Insertion Sort',
            content: `Insertion Sort builds the sorted array one element at a time. It's like sorting playing cards in your hands.

**Time Complexity:**
- Best Case: O(n) - already sorted
- Average/Worst Case: O(n²)

**Space Complexity:** O(1)

**Algorithm Steps:**
1. Start with second element
2. Compare with previous elements
3. Insert in correct position
4. Repeat for all elements`
          },
          {
            heading: 'Implementation',
            content: `**C++ Implementation:**

\`\`\`cpp
void insertionSort(int arr[], int n) {
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}
\`\`\`

**Python Implementation:**

\`\`\`python
def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr
\`\`\``
          }
        ]
      }
    },
    {
      title: 'Merge Sort',
      slug: 'merge-sort',
      description: 'Learn merge sort: divide and conquer algorithm with O(n log n) time complexity',
      difficulty: 'intermediate',
      order: 103,
      article: {
        sections: [
          {
            heading: 'Introduction to Merge Sort',
            content: `Merge Sort is a divide-and-conquer algorithm that divides the array into halves, sorts them, and merges them back.

**Time Complexity:** O(n log n) in all cases
**Space Complexity:** O(n)

**Algorithm Steps:**
1. Divide array into two halves
2. Recursively sort both halves
3. Merge the sorted halves`
          },
          {
            heading: 'Implementation',
            content: `**C++ Implementation:**

\`\`\`cpp
void merge(int arr[], int left, int mid, int right) {
    int n1 = mid - left + 1;
    int n2 = right - mid;
    
    int L[n1], R[n2];
    for (int i = 0; i < n1; i++) L[i] = arr[left + i];
    for (int j = 0; j < n2; j++) R[j] = arr[mid + 1 + j];
    
    int i = 0, j = 0, k = left;
    while (i < n1 && j < n2) {
        if (L[i] <= R[j]) {
            arr[k++] = L[i++];
        } else {
            arr[k++] = R[j++];
        }
    }
    
    while (i < n1) arr[k++] = L[i++];
    while (j < n2) arr[k++] = R[j++];
}

void mergeSort(int arr[], int left, int right) {
    if (left < right) {
        int mid = left + (right - left) / 2;
        mergeSort(arr, left, mid);
        mergeSort(arr, mid + 1, right);
        merge(arr, left, mid, right);
    }
}
\`\`\`

**Python Implementation:**

\`\`\`python
def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    
    result.extend(left[i:])
    result.extend(right[j:])
    return result
\`\`\``
          }
        ]
      }
    },
    {
      title: 'Quick Sort',
      slug: 'quick-sort',
      description: 'Learn quick sort: efficient divide and conquer algorithm with average O(n log n) complexity',
      difficulty: 'intermediate',
      order: 104,
      article: {
        sections: [
          {
            heading: 'Introduction to Quick Sort',
            content: `Quick Sort is a divide-and-conquer algorithm that picks a pivot and partitions the array around it.

**Time Complexity:**
- Best/Average: O(n log n)
- Worst: O(n²) - when pivot is always smallest/largest

**Space Complexity:** O(log n) average, O(n) worst

**Algorithm Steps:**
1. Choose a pivot element
2. Partition array around pivot
3. Recursively sort subarrays`
          },
          {
            heading: 'Implementation',
            content: `**C++ Implementation:**

\`\`\`cpp
int partition(int arr[], int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    
    for (int j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            swap(arr[i], arr[j]);
        }
    }
    swap(arr[i + 1], arr[high]);
    return i + 1;
}

void quickSort(int arr[], int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}
\`\`\`

**Python Implementation:**

\`\`\`python
def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    
    return quick_sort(left) + middle + quick_sort(right)
\`\`\``
          }
        ]
      }
    },
    {
      title: 'Heap Sort',
      slug: 'heap-sort',
      description: 'Learn heap sort: uses binary heap data structure for sorting',
      difficulty: 'intermediate',
      order: 105,
      article: {
        sections: [
          {
            heading: 'Introduction to Heap Sort',
            content: `Heap Sort uses a binary heap to sort elements. It builds a max heap and repeatedly extracts the maximum element.

**Time Complexity:** O(n log n) in all cases
**Space Complexity:** O(1)

**Algorithm Steps:**
1. Build max heap from array
2. Swap root with last element
3. Reduce heap size and heapify
4. Repeat until sorted`
          },
          {
            heading: 'Implementation',
            content: `**C++ Implementation:**

\`\`\`cpp
void heapify(int arr[], int n, int i) {
    int largest = i;
    int left = 2 * i + 1;
    int right = 2 * i + 2;
    
    if (left < n && arr[left] > arr[largest])
        largest = left;
    if (right < n && arr[right] > arr[largest])
        largest = right;
    
    if (largest != i) {
        swap(arr[i], arr[largest]);
        heapify(arr, n, largest);
    }
}

void heapSort(int arr[], int n) {
    for (int i = n / 2 - 1; i >= 0; i--)
        heapify(arr, n, i);
    
    for (int i = n - 1; i > 0; i--) {
        swap(arr[0], arr[i]);
        heapify(arr, i, 0);
    }
}
\`\`\`

**Python Implementation:**

\`\`\`python
def heapify(arr, n, i):
    largest = i
    left = 2 * i + 1
    right = 2 * i + 2
    
    if left < n and arr[left] > arr[largest]:
        largest = left
    if right < n and arr[right] > arr[largest]:
        largest = right
    
    if largest != i:
        arr[i], arr[largest] = arr[largest], arr[i]
        heapify(arr, n, largest)

def heap_sort(arr):
    n = len(arr)
    
    for i in range(n // 2 - 1, -1, -1):
        heapify(arr, n, i)
    
    for i in range(n - 1, 0, -1):
        arr[0], arr[i] = arr[i], arr[0]
        heapify(arr, i, 0)
    
    return arr
\`\`\``
          }
        ]
      }
    },
    {
      title: 'Counting Sort',
      slug: 'counting-sort',
      description: 'Learn counting sort: linear time sorting for integers in a limited range',
      difficulty: 'intermediate',
      order: 106,
      article: {
        sections: [
          {
            heading: 'Introduction to Counting Sort',
            content: `Counting Sort counts occurrences of each element and uses this to determine positions.

**Time Complexity:** O(n + k) where k is range
**Space Complexity:** O(k)

**When to Use:**
- Small range of integers
- Non-negative integers
- When range is not much larger than n`
          },
          {
            heading: 'Implementation',
            content: `**C++ Implementation:**

\`\`\`cpp
void countingSort(int arr[], int n) {
    int maxVal = *max_element(arr, arr + n);
    int count[maxVal + 1] = {0};
    
    for (int i = 0; i < n; i++)
        count[arr[i]]++;
    
    int index = 0;
    for (int i = 0; i <= maxVal; i++) {
        while (count[i] > 0) {
            arr[index++] = i;
            count[i]--;
        }
    }
}
\`\`\`

**Python Implementation:**

\`\`\`python
def counting_sort(arr):
    max_val = max(arr)
    count = [0] * (max_val + 1)
    
    for num in arr:
        count[num] += 1
    
    index = 0
    for i in range(max_val + 1):
        while count[i] > 0:
            arr[index] = i
            index += 1
            count[i] -= 1
    
    return arr
\`\`\``
          }
        ]
      }
    },
    {
      title: 'Radix Sort',
      slug: 'radix-sort',
      description: 'Learn radix sort: sorts numbers by processing digits from least to most significant',
      difficulty: 'advanced',
      order: 107,
      article: {
        sections: [
          {
            heading: 'Introduction to Radix Sort',
            content: `Radix Sort processes digits from least significant to most significant, using a stable sorting algorithm (like counting sort) as a subroutine.

**Time Complexity:** O(d * (n + k)) where d is number of digits
**Space Complexity:** O(n + k)

**Algorithm Steps:**
1. Sort by least significant digit
2. Sort by next digit
3. Continue for all digits`
          },
          {
            heading: 'Implementation',
            content: `**Python Implementation:**

\`\`\`python
def counting_sort_for_radix(arr, exp):
    n = len(arr)
    output = [0] * n
    count = [0] * 10
    
    for i in range(n):
        index = (arr[i] // exp) % 10
        count[index] += 1
    
    for i in range(1, 10):
        count[i] += count[i - 1]
    
    i = n - 1
    while i >= 0:
        index = (arr[i] // exp) % 10
        output[count[index] - 1] = arr[i]
        count[index] -= 1
        i -= 1
    
    for i in range(n):
        arr[i] = output[i]

def radix_sort(arr):
    max_val = max(arr)
    exp = 1
    while max_val // exp > 0:
        counting_sort_for_radix(arr, exp)
        exp *= 10
    return arr
\`\`\``
          }
        ]
      }
    },
    // ============================================
    // DATA STRUCTURES
    // ============================================
    {
      title: 'Linked Lists',
      slug: 'linked-lists',
      description: 'Learn linked lists: dynamic data structure with nodes connected by pointers',
      difficulty: 'beginner',
      order: 200,
      article: {
        sections: [
          {
            heading: 'Introduction to Linked Lists',
            content: `A linked list is a linear data structure where elements are stored in nodes, and each node points to the next node.

**Types:**
- Singly Linked List
- Doubly Linked List
- Circular Linked List

**Time Complexities:**
- Access: O(n)
- Search: O(n)
- Insertion: O(1) at head, O(n) at position
- Deletion: O(1) at head, O(n) at position`
          },
          {
            heading: 'Singly Linked List Implementation',
            content: `**C++ Implementation:**

\`\`\`cpp
struct Node {
    int data;
    Node* next;
    Node(int val) : data(val), next(nullptr) {}
};

class LinkedList {
private:
    Node* head;
public:
    LinkedList() : head(nullptr) {}
    
    void insertAtHead(int val) {
        Node* newNode = new Node(val);
        newNode->next = head;
        head = newNode;
    }
    
    void insertAtTail(int val) {
        Node* newNode = new Node(val);
        if (!head) {
            head = newNode;
            return;
        }
        Node* current = head;
        while (current->next) {
            current = current->next;
        }
        current->next = newNode;
    }
    
    void deleteNode(int val) {
        if (!head) return;
        if (head->data == val) {
            Node* temp = head;
            head = head->next;
            delete temp;
            return;
        }
        Node* current = head;
        while (current->next && current->next->data != val) {
            current = current->next;
        }
        if (current->next) {
            Node* temp = current->next;
            current->next = current->next->next;
            delete temp;
        }
    }
};
\`\`\`

**Python Implementation:**

\`\`\`python
class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None
    
    def insert_at_head(self, data):
        new_node = Node(data)
        new_node.next = self.head
        self.head = new_node
    
    def insert_at_tail(self, data):
        new_node = Node(data)
        if not self.head:
            self.head = new_node
            return
        current = self.head
        while current.next:
            current = current.next
        current.next = new_node
    
    def delete_node(self, data):
        if not self.head:
            return
        if self.head.data == data:
            self.head = self.head.next
            return
        current = self.head
        while current.next and current.next.data != data:
            current = current.next
        if current.next:
            current.next = current.next.next
\`\`\``
          }
        ]
      }
    },
    {
      title: 'Stacks',
      slug: 'stacks',
      description: 'Learn stacks: LIFO (Last In First Out) data structure',
      difficulty: 'beginner',
      order: 201,
      article: {
        sections: [
          {
            heading: 'Introduction to Stacks',
            content: `A stack is a linear data structure that follows LIFO (Last In First Out) principle.

**Operations:**
- push(x): Add element to top
- pop(): Remove top element
- peek(): View top element
- isEmpty(): Check if empty

**Time Complexity:** O(1) for all operations
**Space Complexity:** O(n)`
          },
          {
            heading: 'Implementation',
            content: `**C++ Implementation:**

\`\`\`cpp
#include <stack>
// Using STL
stack<int> st;
st.push(10);
st.push(20);
int top = st.top();
st.pop();

// Custom implementation
class Stack {
private:
    int* arr;
    int top;
    int capacity;
public:
    Stack(int size) {
        capacity = size;
        arr = new int[capacity];
        top = -1;
    }
    
    void push(int x) {
        if (top == capacity - 1) {
            cout << "Stack overflow";
            return;
        }
        arr[++top] = x;
    }
    
    int pop() {
        if (isEmpty()) {
            cout << "Stack underflow";
            return -1;
        }
        return arr[top--];
    }
    
    int peek() {
        if (isEmpty()) return -1;
        return arr[top];
    }
    
    bool isEmpty() {
        return top == -1;
    }
};
\`\`\`

**Python Implementation:**

\`\`\`python
# Using list
stack = []
stack.append(10)  # push
stack.append(20)
top = stack[-1]   # peek
stack.pop()       # pop

# Custom implementation
class Stack:
    def __init__(self):
        self.items = []
    
    def push(self, item):
        self.items.append(item)
    
    def pop(self):
        if self.is_empty():
            raise IndexError("Stack is empty")
        return self.items.pop()
    
    def peek(self):
        if self.is_empty():
            return None
        return self.items[-1]
    
    def is_empty(self):
        return len(self.items) == 0
\`\`\``
          }
        ]
      }
    },
    {
      title: 'Queues',
      slug: 'queues',
      description: 'Learn queues: FIFO (First In First Out) data structure',
      difficulty: 'beginner',
      order: 202,
      article: {
        sections: [
          {
            heading: 'Introduction to Queues',
            content: `A queue is a linear data structure that follows FIFO (First In First Out) principle.

**Operations:**
- enqueue(x): Add element to rear
- dequeue(): Remove element from front
- front(): View front element
- isEmpty(): Check if empty

**Types:**
- Simple Queue
- Circular Queue
- Priority Queue
- Deque (Double-ended Queue)`
          },
          {
            heading: 'Implementation',
            content: `**C++ Implementation:**

\`\`\`cpp
#include <queue>
// Using STL
queue<int> q;
q.push(10);
q.push(20);
int front = q.front();
q.pop();

// Custom implementation
class Queue {
private:
    int* arr;
    int front;
    int rear;
    int capacity;
public:
    Queue(int size) {
        capacity = size;
        arr = new int[capacity];
        front = rear = -1;
    }
    
    void enqueue(int x) {
        if (rear == capacity - 1) {
            cout << "Queue is full";
            return;
        }
        if (front == -1) front = 0;
        arr[++rear] = x;
    }
    
    int dequeue() {
        if (isEmpty()) {
            cout << "Queue is empty";
            return -1;
        }
        int item = arr[front];
        if (front == rear) {
            front = rear = -1;
        } else {
            front++;
        }
        return item;
    }
};
\`\`\`

**Python Implementation:**

\`\`\`python
from collections import deque
# Using deque (recommended)
queue = deque()
queue.append(10)  # enqueue
queue.append(20)
front = queue[0]   # peek
queue.popleft()    # dequeue

# Custom implementation
class Queue:
    def __init__(self):
        self.items = []
    
    def enqueue(self, item):
        self.items.append(item)
    
    def dequeue(self):
        if self.is_empty():
            raise IndexError("Queue is empty")
        return self.items.pop(0)
    
    def front(self):
        if self.is_empty():
            return None
        return self.items[0]
    
    def is_empty(self):
        return len(self.items) == 0
\`\`\``
          }
        ]
      }
    },
    {
      title: 'Binary Trees',
      slug: 'binary-trees',
      description: 'Learn binary trees: hierarchical data structure with at most two children per node',
      difficulty: 'intermediate',
      order: 300,
      article: {
        sections: [
          {
            heading: 'Introduction to Binary Trees',
            content: `A binary tree is a tree data structure where each node has at most two children: left and right.

**Types:**
- Full Binary Tree: Every node has 0 or 2 children
- Complete Binary Tree: All levels filled except possibly last
- Perfect Binary Tree: All levels completely filled
- Balanced Binary Tree: Height difference <= 1

**Tree Traversals:**
- Preorder: Root → Left → Right
- Inorder: Left → Root → Right
- Postorder: Left → Right → Root
- Level Order: Level by level`
          },
          {
            heading: 'Implementation',
            content: `**C++ Implementation:**

\`\`\`cpp
struct TreeNode {
    int data;
    TreeNode* left;
    TreeNode* right;
    TreeNode(int val) : data(val), left(nullptr), right(nullptr) {}
};

// Preorder traversal
void preorder(TreeNode* root) {
    if (root) {
        cout << root->data << " ";
        preorder(root->left);
        preorder(root->right);
    }
}

// Inorder traversal
void inorder(TreeNode* root) {
    if (root) {
        inorder(root->left);
        cout << root->data << " ";
        inorder(root->right);
    }
}

// Postorder traversal
void postorder(TreeNode* root) {
    if (root) {
        postorder(root->left);
        postorder(root->right);
        cout << root->data << " ";
    }
}
\`\`\`

**Python Implementation:**

\`\`\`python
class TreeNode:
    def __init__(self, data):
        self.data = data
        self.left = None
        self.right = None

def preorder(root):
    if root:
        print(root.data, end=" ")
        preorder(root.left)
        preorder(root.right)

def inorder(root):
    if root:
        inorder(root.left)
        print(root.data, end=" ")
        inorder(root.right)

def postorder(root):
    if root:
        postorder(root.left)
        postorder(root.right)
        print(root.data, end=" ")
\`\`\``
          }
        ]
      }
    },
    {
      title: 'Binary Search Trees',
      slug: 'binary-search-trees',
      description: 'Learn BST: ordered binary tree where left < root < right',
      difficulty: 'intermediate',
      order: 301,
      parentSlug: 'binary-trees',
      article: {
        sections: [
          {
            heading: 'Introduction to BST',
            content: `A Binary Search Tree (BST) is a binary tree where:
- Left subtree contains nodes < root
- Right subtree contains nodes > root
- Both subtrees are also BSTs

**Operations:**
- Search: O(log n) average, O(n) worst
- Insert: O(log n) average, O(n) worst
- Delete: O(log n) average, O(n) worst`
          },
          {
            heading: 'Implementation',
            content: `**Python Implementation:**

\`\`\`python
class BSTNode:
    def __init__(self, data):
        self.data = data
        self.left = None
        self.right = None

class BST:
    def __init__(self):
        self.root = None
    
    def insert(self, data):
        self.root = self._insert(self.root, data)
    
    def _insert(self, root, data):
        if not root:
            return BSTNode(data)
        if data < root.data:
            root.left = self._insert(root.left, data)
        elif data > root.data:
            root.right = self._insert(root.right, data)
        return root
    
    def search(self, data):
        return self._search(self.root, data)
    
    def _search(self, root, data):
        if not root or root.data == data:
            return root
        if data < root.data:
            return self._search(root.left, data)
        return self._search(root.right, data)
\`\`\``
          }
        ]
      }
    },
    {
      title: 'Graphs',
      slug: 'graphs',
      description: 'Learn graphs: collection of nodes (vertices) connected by edges',
      difficulty: 'intermediate',
      order: 400,
      article: {
        sections: [
          {
            heading: 'Introduction to Graphs',
            content: `A graph is a collection of vertices (nodes) connected by edges.

**Types:**
- Directed vs Undirected
- Weighted vs Unweighted
- Cyclic vs Acyclic

**Representation:**
- Adjacency Matrix
- Adjacency List

**Graph Traversals:**
- BFS (Breadth-First Search)
- DFS (Depth-First Search)`
          },
          {
            heading: 'Implementation',
            content: `**Python Implementation - Adjacency List:**

\`\`\`python
from collections import defaultdict, deque

class Graph:
    def __init__(self):
        self.graph = defaultdict(list)
    
    def add_edge(self, u, v):
        self.graph[u].append(v)
    
    def bfs(self, start):
        visited = set()
        queue = deque([start])
        visited.add(start)
        
        while queue:
            vertex = queue.popleft()
            print(vertex, end=" ")
            
            for neighbor in self.graph[vertex]:
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)
    
    def dfs(self, start):
        visited = set()
        self._dfs_util(start, visited)
    
    def _dfs_util(self, vertex, visited):
        visited.add(vertex)
        print(vertex, end=" ")
        
        for neighbor in self.graph[vertex]:
            if neighbor not in visited:
                self._dfs_util(neighbor, visited)
\`\`\``
          }
        ]
      }
    },
    {
      title: 'Heaps',
      slug: 'heaps',
      description: 'Learn heaps: complete binary tree with heap property',
      difficulty: 'intermediate',
      order: 500,
      article: {
        sections: [
          {
            heading: 'Introduction to Heaps',
            content: `A heap is a complete binary tree that satisfies the heap property:
- Max Heap: Parent >= Children
- Min Heap: Parent <= Children

**Applications:**
- Priority Queues
- Heap Sort
- Finding min/max efficiently

**Operations:**
- Insert: O(log n)
- Extract Min/Max: O(log n)
- Get Min/Max: O(1)`
          },
          {
            heading: 'Implementation',
            content: `**Python Implementation - Min Heap:**

\`\`\`python
import heapq

# Using heapq module
heap = []
heapq.heappush(heap, 10)
heapq.heappush(heap, 5)
heapq.heappush(heap, 20)
min_val = heapq.heappop(heap)  # 5

# Custom MinHeap
class MinHeap:
    def __init__(self):
        self.heap = []
    
    def parent(self, i):
        return (i - 1) // 2
    
    def left_child(self, i):
        return 2 * i + 1
    
    def right_child(self, i):
        return 2 * i + 2
    
    def insert(self, key):
        self.heap.append(key)
        self._heapify_up(len(self.heap) - 1)
    
    def _heapify_up(self, i):
        while i > 0 and self.heap[self.parent(i)] > self.heap[i]:
            self.heap[self.parent(i)], self.heap[i] = self.heap[i], self.heap[self.parent(i)]
            i = self.parent(i)
    
    def extract_min(self):
        if not self.heap:
            return None
        if len(self.heap) == 1:
            return self.heap.pop()
        
        root = self.heap[0]
        self.heap[0] = self.heap.pop()
        self._heapify_down(0)
        return root
\`\`\``
          }
        ]
      }
    },
    {
      title: 'Hash Tables',
      slug: 'hash-tables',
      description: 'Learn hash tables: key-value data structure with O(1) average lookup',
      difficulty: 'intermediate',
      order: 600,
      article: {
        sections: [
          {
            heading: 'Introduction to Hash Tables',
            content: `A hash table is a data structure that maps keys to values using a hash function.

**Time Complexity:**
- Average: O(1) for all operations
- Worst: O(n) due to collisions

**Components:**
- Hash Function
- Buckets/Array
- Collision Resolution (Chaining, Open Addressing)`
          },
          {
            heading: 'Implementation',
            content: `**Python Implementation:**

\`\`\`python
# Using dictionary (built-in hash table)
hash_map = {}
hash_map['key1'] = 'value1'
hash_map['key2'] = 'value2'
value = hash_map.get('key1')

# Custom HashTable
class HashTable:
    def __init__(self, size=10):
        self.size = size
        self.buckets = [[] for _ in range(size)]
    
    def _hash(self, key):
        return hash(key) % self.size
    
    def insert(self, key, value):
        index = self._hash(key)
        bucket = self.buckets[index]
        
        for i, (k, v) in enumerate(bucket):
            if k == key:
                bucket[i] = (key, value)
                return
        bucket.append((key, value))
    
    def get(self, key):
        index = self._hash(key)
        bucket = self.buckets[index]
        
        for k, v in bucket:
            if k == key:
                return v
        return None
    
    def delete(self, key):
        index = self._hash(key)
        bucket = self.buckets[index]
        
        for i, (k, v) in enumerate(bucket):
            if k == key:
                bucket.pop(i)
                return
\`\`\``
          }
        ]
      }
    },
    // ============================================
    // OOP CONCEPTS
    // ============================================
    {
      title: 'Object-Oriented Programming in C++',
      slug: 'oop-cpp',
      description: 'Learn OOP in C++: classes, objects, inheritance, polymorphism, encapsulation, abstraction',
      difficulty: 'intermediate',
      order: 700,
      article: {
        sections: [
          {
            heading: 'Introduction to OOP',
            content: `Object-Oriented Programming (OOP) is a programming paradigm based on objects.

**Four Pillars of OOP:**
1. **Encapsulation**: Bundling data and methods together
2. **Inheritance**: Creating new classes from existing ones
3. **Polymorphism**: One interface, multiple implementations
4. **Abstraction**: Hiding implementation details`
          },
          {
            heading: 'Classes and Objects',
            content: `**C++ Class Definition:**

\`\`\`cpp
class Rectangle {
private:
    double width;
    double height;
    
public:
    // Constructor
    Rectangle(double w, double h) : width(w), height(h) {}
    
    // Getter methods
    double getWidth() const { return width; }
    double getHeight() const { return height; }
    
    // Setter methods
    void setWidth(double w) { width = w; }
    void setHeight(double h) { height = h; }
    
    // Member functions
    double area() const {
        return width * height;
    }
    
    double perimeter() const {
        return 2 * (width + height);
    }
};

// Usage
Rectangle rect(5.0, 3.0);
cout << "Area: " << rect.area() << endl;
\`\`\``
          },
          {
            heading: 'Inheritance',
            content: `**C++ Inheritance:**

\`\`\`cpp
// Base class
class Shape {
protected:
    double x, y;
public:
    Shape(double x, double y) : x(x), y(y) {}
    virtual double area() const = 0;  // Pure virtual function
    virtual ~Shape() {}
};

// Derived class
class Circle : public Shape {
private:
    double radius;
public:
    Circle(double x, double y, double r) : Shape(x, y), radius(r) {}
    
    double area() const override {
        return 3.14159 * radius * radius;
    }
};

class Rectangle : public Shape {
private:
    double width, height;
public:
    Rectangle(double x, double y, double w, double h) 
        : Shape(x, y), width(w), height(h) {}
    
    double area() const override {
        return width * height;
    }
};
\`\`\``
          },
          {
            heading: 'Polymorphism',
            content: `**Virtual Functions:**

\`\`\`cpp
class Animal {
public:
    virtual void makeSound() {
        cout << "Some sound" << endl;
    }
    virtual ~Animal() {}
};

class Dog : public Animal {
public:
    void makeSound() override {
        cout << "Woof!" << endl;
    }
};

class Cat : public Animal {
public:
    void makeSound() override {
        cout << "Meow!" << endl;
    }
};

// Polymorphic behavior
Animal* animal1 = new Dog();
Animal* animal2 = new Cat();
animal1->makeSound();  // "Woof!"
animal2->makeSound();  // "Meow!"
\`\`\``
          },
          {
            heading: 'Encapsulation',
            content: `**Access Modifiers:**

\`\`\`cpp
class BankAccount {
private:
    double balance;  // Hidden from outside
    
public:
    BankAccount(double initialBalance) : balance(initialBalance) {}
    
    void deposit(double amount) {
        if (amount > 0) {
            balance += amount;
        }
    }
    
    bool withdraw(double amount) {
        if (amount > 0 && amount <= balance) {
            balance -= amount;
            return true;
        }
        return false;
    }
    
    double getBalance() const {
        return balance;
    }
};
\`\`\``
          }
        ]
      }
    },
    {
      title: 'Object-Oriented Programming in Python',
      slug: 'oop-python',
      description: 'Learn OOP in Python: classes, objects, inheritance, polymorphism, encapsulation, abstraction',
      difficulty: 'intermediate',
      order: 701,
      article: {
        sections: [
          {
            heading: 'Introduction to OOP in Python',
            content: `Python supports OOP with classes and objects. All data types in Python are objects.

**Key Concepts:**
- Classes and Objects
- Inheritance
- Polymorphism
- Encapsulation
- Abstraction
- Special Methods (Magic Methods)`
          },
          {
            heading: 'Classes and Objects',
            content: `**Python Class Definition:**

\`\`\`python
class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height
    
    def area(self):
        return self.width * self.height
    
    def perimeter(self):
        return 2 * (self.width + self.height)
    
    def __str__(self):
        return f"Rectangle({self.width}, {self.height})"

# Usage
rect = Rectangle(5, 3)
print(rect.area())  # 15
print(rect)  # Rectangle(5, 3)
\`\`\``
          },
          {
            heading: 'Inheritance',
            content: `**Python Inheritance:**

\`\`\`python
# Base class
class Animal:
    def __init__(self, name):
        self.name = name
    
    def make_sound(self):
        raise NotImplementedError("Subclass must implement")
    
    def __str__(self):
        return f"{self.name}"

# Derived class
class Dog(Animal):
    def __init__(self, name, breed):
        super().__init__(name)
        self.breed = breed
    
    def make_sound(self):
        return "Woof!"
    
    def __str__(self):
        return f"{self.name} ({self.breed})"

class Cat(Animal):
    def make_sound(self):
        return "Meow!"

# Usage
dog = Dog("Buddy", "Golden Retriever")
cat = Cat("Whiskers")
print(dog.make_sound())  # "Woof!"
print(cat.make_sound())  # "Meow!"
\`\`\``
          },
          {
            heading: 'Encapsulation',
            content: `**Python Encapsulation:**

\`\`\`python
class BankAccount:
    def __init__(self, initial_balance):
        self._balance = initial_balance  # Protected (convention)
    
    @property
    def balance(self):
        return self._balance
    
    def deposit(self, amount):
        if amount > 0:
            self._balance += amount
    
    def withdraw(self, amount):
        if 0 < amount <= self._balance:
            self._balance -= amount
            return True
        return False

# Using private attributes (name mangling)
class SecretAccount:
    def __init__(self, initial_balance):
        self.__balance = initial_balance  # Private (name mangling)
    
    def get_balance(self):
        return self.__balance
\`\`\``
          },
          {
            heading: 'Polymorphism',
            content: `**Python Polymorphism:**

\`\`\`python
class Shape:
    def area(self):
        raise NotImplementedError

class Rectangle(Shape):
    def __init__(self, width, height):
        self.width = width
        self.height = height
    
    def area(self):
        return self.width * self.height

class Circle(Shape):
    def __init__(self, radius):
        self.radius = radius
    
    def area(self):
        return 3.14159 * self.radius ** 2

# Polymorphic function
def print_area(shape):
    print(f"Area: {shape.area()}")

rect = Rectangle(5, 3)
circle = Circle(4)
print_area(rect)   # Area: 15
print_area(circle) # Area: 50.265...
\`\`\``
          },
          {
            heading: 'Special Methods',
            content: `**Magic Methods:**

\`\`\`python
class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y
    
    def __str__(self):
        return f"Vector({self.x}, {self.y})"
    
    def __repr__(self):
        return f"Vector({self.x}, {self.y})"
    
    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)
    
    def __eq__(self, other):
        return self.x == other.x and self.y == other.y
    
    def __len__(self):
        return int((self.x**2 + self.y**2)**0.5)

v1 = Vector(3, 4)
v2 = Vector(1, 2)
v3 = v1 + v2  # Vector(4, 6)
print(v1)     # Vector(3, 4)
print(len(v1))  # 5
\`\`\``
          }
        ]
      }
    },
    // ============================================
    // ADVANCED ALGORITHMS
    // ============================================
    {
      title: 'Recursion',
      slug: 'recursion',
      description: 'Learn recursion: function calling itself, base cases, and recursive thinking',
      difficulty: 'intermediate',
      order: 800,
      article: {
        sections: [
          {
            heading: 'Introduction to Recursion',
            content: `Recursion is a programming technique where a function calls itself to solve a problem.

**Key Components:**
- Base Case: Stopping condition
- Recursive Case: Function calls itself with smaller problem

**When to Use:**
- Problems that can be broken into similar subproblems
- Tree/graph traversals
- Divide and conquer algorithms`
          },
          {
            heading: 'Examples',
            content: `**Factorial:**

\`\`\`cpp
// C++
int factorial(int n) {
    if (n <= 1) return 1;  // Base case
    return n * factorial(n - 1);  // Recursive case
}
\`\`\`

\`\`\`python
# Python
def factorial(n):
    if n <= 1:
        return 1  # Base case
    return n * factorial(n - 1)  # Recursive case
\`\`\`

**Fibonacci:**

\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)
\`\`\`

**Tower of Hanoi:**

\`\`\`python
def tower_of_hanoi(n, source, destination, auxiliary):
    if n == 1:
        print(f"Move disk 1 from {source} to {destination}")
        return
    tower_of_hanoi(n - 1, source, auxiliary, destination)
    print(f"Move disk {n} from {source} to {destination}")
    tower_of_hanoi(n - 1, auxiliary, destination, source)
\`\`\``
          }
        ]
      }
    },
    {
      title: 'Dynamic Programming',
      slug: 'dynamic-programming',
      description: 'Learn DP: solving problems by breaking them into overlapping subproblems',
      difficulty: 'advanced',
      order: 900,
      article: {
        sections: [
          {
            heading: 'Introduction to Dynamic Programming',
            content: `Dynamic Programming is an optimization technique for solving problems by breaking them into overlapping subproblems.

**Key Characteristics:**
- Overlapping subproblems
- Optimal substructure
- Memoization or tabulation

**Approaches:**
- Top-down (Memoization)
- Bottom-up (Tabulation)`
          },
          {
            heading: 'Classic Problems',
            content: `**Fibonacci with Memoization:**

\`\`\`python
def fib_memo(n, memo={}):
    if n in memo:
        return memo[n]
    if n <= 1:
        return n
    memo[n] = fib_memo(n - 1, memo) + fib_memo(n - 2, memo)
    return memo[n]
\`\`\`

**Longest Common Subsequence:**

\`\`\`python
def lcs(s1, s2):
    m, n = len(s1), len(s2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i-1] == s2[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    
    return dp[m][n]
\`\`\`

**Knapsack Problem:**

\`\`\`python
def knapsack(weights, values, capacity):
    n = len(weights)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]
    
    for i in range(1, n + 1):
        for w in range(1, capacity + 1):
            if weights[i-1] <= w:
                dp[i][w] = max(
                    dp[i-1][w],
                    dp[i-1][w - weights[i-1]] + values[i-1]
                )
            else:
                dp[i][w] = dp[i-1][w]
    
    return dp[n][capacity]
\`\`\``
          }
        ]
      }
    },
    {
      title: 'Greedy Algorithms',
      slug: 'greedy-algorithms',
      description: 'Learn greedy algorithms: making locally optimal choices at each step',
      difficulty: 'intermediate',
      order: 901,
      article: {
        sections: [
          {
            heading: 'Introduction to Greedy Algorithms',
            content: `Greedy algorithms make the best choice at each step, hoping it leads to a global optimum.

**Characteristics:**
- Greedy choice property
- Optimal substructure

**Common Problems:**
- Activity Selection
- Fractional Knapsack
- Minimum Spanning Tree
- Huffman Coding`
          },
          {
            heading: 'Activity Selection Problem',
            content: `**Problem:** Select maximum number of non-overlapping activities.

\`\`\`python
def activity_selection(activities):
    # Sort by finish time
    activities.sort(key=lambda x: x[1])
    
    selected = [activities[0]]
    last_finish = activities[0][1]
    
    for start, finish in activities[1:]:
        if start >= last_finish:
            selected.append((start, finish))
            last_finish = finish
    
    return selected
\`\`\``
          }
        ]
      }
    },
    {
      title: 'Backtracking',
      slug: 'backtracking',
      description: 'Learn backtracking: systematic way to explore all possible solutions',
      difficulty: 'advanced',
      order: 902,
      article: {
        sections: [
          {
            heading: 'Introduction to Backtracking',
            content: `Backtracking is a systematic way to explore all possible solutions by building candidates incrementally and abandoning partial candidates.

**Key Steps:**
1. Choose
2. Explore
3. Unchoose (backtrack)

**Common Problems:**
- N-Queens
- Sudoku Solver
- Permutations
- Subset Generation`
          },
          {
            heading: 'N-Queens Problem',
            content: `**Problem:** Place N queens on N×N board so no two attack each other.

\`\`\`python
def solve_n_queens(n):
    board = [['.' for _ in range(n)] for _ in range(n)]
    solutions = []
    
    def is_safe(row, col):
        # Check column
        for i in range(row):
            if board[i][col] == 'Q':
                return False
        
        # Check diagonal
        for i, j in zip(range(row-1, -1, -1), range(col-1, -1, -1)):
            if board[i][j] == 'Q':
                return False
        
        # Check anti-diagonal
        for i, j in zip(range(row-1, -1, -1), range(col+1, n)):
            if board[i][j] == 'Q':
                return False
        
        return True
    
    def backtrack(row):
        if row == n:
            solutions.append([''.join(r) for r in board])
            return
        
        for col in range(n):
            if is_safe(row, col):
                board[row][col] = 'Q'
                backtrack(row + 1)
                board[row][col] = '.'  # Backtrack
    
    backtrack(0)
    return solutions
\`\`\``
          }
        ]
      }
    },
    {
      title: 'Graph Algorithms - BFS and DFS',
      slug: 'graph-algorithms-bfs-dfs',
      description: 'Learn graph traversal: Breadth-First Search and Depth-First Search',
      difficulty: 'intermediate',
      order: 1000,
      parentSlug: 'graphs',
      article: {
        sections: [
          {
            heading: 'Breadth-First Search (BFS)',
            content: `BFS explores graph level by level, using a queue.

**Time Complexity:** O(V + E)
**Space Complexity:** O(V)

**Applications:**
- Shortest path in unweighted graph
- Level-order traversal
- Finding connected components`
          },
          {
            heading: 'Depth-First Search (DFS)',
            content: `DFS explores as far as possible before backtracking.

**Time Complexity:** O(V + E)
**Space Complexity:** O(V)

**Applications:**
- Topological sorting
- Finding cycles
- Path finding`
          }
        ]
      }
    },
    {
      title: 'Dijkstra Algorithm',
      slug: 'dijkstra-algorithm',
      description: 'Learn Dijkstra: find shortest path from source to all vertices',
      difficulty: 'advanced',
      order: 1001,
      parentSlug: 'graphs',
      article: {
        sections: [
          {
            heading: 'Introduction to Dijkstra',
            content: `Dijkstra's algorithm finds shortest paths from a source vertex to all other vertices in a weighted graph.

**Requirements:**
- Non-negative edge weights
- Connected graph

**Time Complexity:** O((V + E) log V) with priority queue
**Space Complexity:** O(V)`
          },
          {
            heading: 'Implementation',
            content: `**Python Implementation:**

\`\`\`python
import heapq

def dijkstra(graph, start):
    distances = {vertex: float('inf') for vertex in graph}
    distances[start] = 0
    pq = [(0, start)]
    visited = set()
    
    while pq:
        current_dist, current = heapq.heappop(pq)
        
        if current in visited:
            continue
        
        visited.add(current)
        
        for neighbor, weight in graph[current].items():
            distance = current_dist + weight
            
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                heapq.heappush(pq, (distance, neighbor))
    
    return distances
\`\`\``
          }
        ]
      }
    },
    {
      title: 'String Algorithms',
      slug: 'string-algorithms',
      description: 'Learn string algorithms: pattern matching, substring search, string manipulation',
      difficulty: 'intermediate',
      order: 1100,
      article: {
        sections: [
          {
            heading: 'String Matching',
            content: `**Naive Pattern Matching:**

\`\`\`python
def naive_search(text, pattern):
    n, m = len(text), len(pattern)
    matches = []
    
    for i in range(n - m + 1):
        if text[i:i+m] == pattern:
            matches.append(i)
    
    return matches
\`\`\`

**KMP Algorithm:**

\`\`\`python
def kmp_search(text, pattern):
    def build_lps(pattern):
        lps = [0] * len(pattern)
        length = 0
        i = 1
        
        while i < len(pattern):
            if pattern[i] == pattern[length]:
                length += 1
                lps[i] = length
                i += 1
            else:
                if length != 0:
                    length = lps[length - 1]
                else:
                    lps[i] = 0
                    i += 1
        return lps
    
    lps = build_lps(pattern)
    i = j = 0
    matches = []
    
    while i < len(text):
        if text[i] == pattern[j]:
            i += 1
            j += 1
        
        if j == len(pattern):
            matches.append(i - j)
            j = lps[j - 1]
        elif i < len(text) and text[i] != pattern[j]:
            if j != 0:
                j = lps[j - 1]
            else:
                i += 1
    
    return matches
\`\`\``
          }
        ]
      }
    },
    {
      title: 'Bit Manipulation',
      slug: 'bit-manipulation',
      description: 'Learn bit manipulation: operations on binary representations',
      difficulty: 'advanced',
      order: 1200,
      article: {
        sections: [
          {
            heading: 'Introduction to Bit Manipulation',
            content: `Bit manipulation involves operations on binary representations of numbers.

**Common Operations:**
- AND (&)
- OR (|)
- XOR (^)
- NOT (~)
- Left Shift (<<)
- Right Shift (>>)`
          },
          {
            heading: 'Common Problems',
            content: `**Check if power of 2:**

\`\`\`python
def is_power_of_2(n):
    return n > 0 and (n & (n - 1)) == 0
\`\`\`

**Count set bits:**

\`\`\`python
def count_bits(n):
    count = 0
    while n:
        count += n & 1
        n >>= 1
    return count

# Or using built-in
def count_bits_builtin(n):
    return bin(n).count('1')
\`\`\`

**Find missing number:**

\`\`\`python
def find_missing_number(arr, n):
    xor_all = 0
    xor_arr = 0
    
    for i in range(1, n + 1):
        xor_all ^= i
    
    for num in arr:
        xor_arr ^= num
    
    return xor_all ^ xor_arr
\`\`\``
          }
        ]
      }
    }
  ];

  // Create concepts
  for (const conceptData of concepts) {
    const parentId = conceptData.parentSlug ? conceptMap.get(conceptData.parentSlug) : undefined;
    
    const concept = await prisma.concept.create({
      data: {
        title: conceptData.title,
        slug: conceptData.slug,
        description: conceptData.description,
        difficulty: conceptData.difficulty,
        order: conceptData.order,
        parentId: parentId,
      },
    });
    
    conceptMap.set(conceptData.slug, concept.id);
    
    // Create article
    await prisma.article.create({
      data: {
        conceptId: concept.id,
        markdown: createArticleMarkdown(conceptData.title, conceptData.article.sections),
      },
    });
    
    // Create FAQs
    if (conceptData.faqs && conceptData.faqs.length > 0) {
      await prisma.fAQ.createMany({
        data: conceptData.faqs.map(faq => ({
          conceptId: concept.id,
          question: faq.question,
          answer: faq.answer,
        })),
      });
    }
    
    // Create practice problems
    if (conceptData.practiceProblems && conceptData.practiceProblems.length > 0) {
      await prisma.practiceProblem.createMany({
        data: conceptData.practiceProblems.map((problem, index) => ({
          conceptId: concept.id,
          title: problem.title,
          description: problem.description,
          difficulty: problem.difficulty,
          examples: problem.examples,
          hints: problem.hints,
          solution: problem.solution,
          testCases: problem.testCases,
          order: index + 1,
        })),
      });
    }
    
    // Create visualizations based on concept type
    const vizType = determineVisualizationType(conceptData);
    if (vizType) {
      const vizConfig = getVisualizationConfig(vizType, conceptData);
      await prisma.visualization.create({
        data: {
          conceptId: concept.id,
          type: vizType,
          config: vizConfig,
        },
      });
    }
    
    console.log(`✅ Created: ${conceptData.title}`);
  }
  
  console.log('\n🎉 Comprehensive seeding completed!');
  console.log(`Created ${concepts.length} concepts with articles, FAQs, and practice problems.`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
