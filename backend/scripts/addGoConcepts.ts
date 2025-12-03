import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ConceptData {
  title: string;
  slug: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  order: number;
  parentSlug?: string;
  article: {
    sections: Array<{
      heading: string;
      content: string;
    }>;
  };
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
  practiceProblems?: Array<{
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    examples: Array<{ input: string; output: string; explanation?: string }>;
    hints: string[];
    solution: string;
    testCases: Array<{ input: string; expectedOutput: string }>;
  }>;
}

function createArticleMarkdown(title: string, sections: Array<{ heading: string; content: string }>): string {
  let markdown = `# ${title}\n\n`;
  sections.forEach((section) => {
    markdown += `## ${section.heading}\n\n${section.content}\n\n`;
  });
  return markdown;
}

async function main() {
  console.log('🌱 Adding Go Language Concepts...\n');

  const conceptMap = new Map<string, string>();

  // Check if Go concepts already exist
  const existingGo = await prisma.concept.findFirst({
    where: { slug: 'go-basics' },
  });

  if (existingGo) {
    console.log('⚠️  Go concepts already exist. Skipping...');
    return;
  }

  const goConcepts: ConceptData[] = [
    {
      title: 'Go Programming Fundamentals',
      slug: 'go-basics',
      description: 'Master Go from basics: syntax, data types, variables, constants, control flow, functions',
      difficulty: 'beginner',
      order: 1,
      article: {
        sections: [
          {
            heading: 'Introduction to Go',
            content: `Go (also known as Golang) is a statically typed, compiled programming language designed at Google. It's known for simplicity, efficiency, and excellent concurrency support.

**Why Learn Go?**
- Simple and clean syntax
- Fast compilation and execution
- Built-in concurrency with goroutines
- Excellent standard library
- Strong typing and garbage collection
- Used by major companies (Google, Docker, Kubernetes, etc.)

**Hello World:**

\`\`\`go
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}
\`\`\`

**Key Features:**
- Compiled language (fast execution)
- Statically typed
- Garbage collected
- Concurrent programming built-in
- Simple and readable syntax`
          },
          {
            heading: 'Data Types and Variables',
            content: `Go has several built-in data types:

**Basic Types:**
- \`bool\` - Boolean (true/false)
- \`string\` - String type
- \`int\`, \`int8\`, \`int16\`, \`int32\`, \`int64\` - Signed integers
- \`uint\`, \`uint8\`, \`uint16\`, \`uint32\`, \`uint64\` - Unsigned integers
- \`float32\`, \`float64\` - Floating point numbers
- \`complex64\`, \`complex128\` - Complex numbers
- \`byte\` - Alias for uint8
- \`rune\` - Alias for int32 (represents Unicode code point)

**Variable Declaration:**

\`\`\`go
// Explicit type declaration
var name string = "Go"
var age int = 10

// Type inference
var name = "Go"
var age = 10

// Short variable declaration (inside functions)
name := "Go"
age := 10

// Multiple variables
var x, y int = 1, 2
a, b := 3, 4
\`\`\`

**Constants:**

\`\`\`go
const Pi = 3.14159
const (
    StatusOK = 200
    StatusNotFound = 404
)
\`\`\``
          },
          {
            heading: 'Control Flow',
            content: `**If-Else:**

\`\`\`go
if x > 0 {
    fmt.Println("Positive")
} else if x < 0 {
    fmt.Println("Negative")
} else {
    fmt.Println("Zero")
}

// If with initialization
if err := doSomething(); err != nil {
    fmt.Println("Error:", err)
}
\`\`\`

**Switch:**

\`\`\`go
switch day {
case "Monday":
    fmt.Println("Start of week")
case "Friday":
    fmt.Println("End of week")
default:
    fmt.Println("Midweek")
}

// Switch without condition (like if-else chain)
switch {
case x < 0:
    fmt.Println("Negative")
case x > 0:
    fmt.Println("Positive")
default:
    fmt.Println("Zero")
}
\`\`\`

**Loops:**

\`\`\`go
// For loop (only loop type in Go)
for i := 0; i < 10; i++ {
    fmt.Println(i)
}

// While-like loop
i := 0
for i < 10 {
    fmt.Println(i)
    i++
}

// Infinite loop
for {
    // break to exit
    break
}

// Range loop
arr := []int{1, 2, 3}
for index, value := range arr {
    fmt.Printf("Index: %d, Value: %d\\n", index, value)
}
\`\`\``
          },
          {
            heading: 'Functions',
            content: `**Function Declaration:**

\`\`\`go
// Basic function
func greet(name string) {
    fmt.Printf("Hello, %s!\\n", name)
}

// Function with return value
func add(a, b int) int {
    return a + b
}

// Multiple return values
func divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, fmt.Errorf("division by zero")
    }
    return a / b, nil
}

// Named return values
func calculate(x, y int) (sum int, product int) {
    sum = x + y
    product = x * y
    return // naked return
}
\`\`\`

**Variadic Functions:**

\`\`\`go
func sum(numbers ...int) int {
    total := 0
    for _, num := range numbers {
        total += num
    }
    return total
}

// Usage
result := sum(1, 2, 3, 4, 5)
\`\`\`

**Functions as Values:**

\`\`\`go
// Function as variable
add := func(a, b int) int {
    return a + b
}

result := add(3, 4)

// Function as parameter
func apply(fn func(int, int) int, a, b int) int {
    return fn(a, b)
}
\`\`\``
          }
        ]
      },
      faqs: [
        {
          question: 'What is Go used for?',
          answer: 'Go is used for building scalable network services, web applications, cloud services, microservices, command-line tools, and system programming. It\'s particularly popular for backend services and DevOps tools.'
        },
        {
          question: 'Is Go object-oriented?',
          answer: 'Go is not a traditional object-oriented language. It doesn\'t have classes or inheritance. Instead, it uses structs and interfaces for code organization and polymorphism.'
        },
        {
          question: 'What makes Go different from other languages?',
          answer: 'Go combines the ease of programming of an interpreted, dynamically typed language with the efficiency and safety of a statically typed, compiled language. It also has built-in concurrency support with goroutines and channels.'
        }
      ]
    },
    {
      title: 'Go Arrays and Slices',
      slug: 'go-arrays-slices',
      description: 'Learn about arrays, slices, and how to work with collections in Go',
      difficulty: 'beginner',
      order: 2,
      parentSlug: 'go-basics',
      article: {
        sections: [
          {
            heading: 'Arrays',
            content: `Arrays in Go are fixed-size sequences of elements of the same type.

**Array Declaration:**

\`\`\`go
// Array of 5 integers
var arr [5]int

// Initialize array
arr := [5]int{1, 2, 3, 4, 5}

// Array with inferred size
arr := [...]int{1, 2, 3, 4, 5}

// Access elements
arr[0] = 10
value := arr[0]

// Array length
length := len(arr)
\`\`\`

**Multi-dimensional Arrays:**

\`\`\`go
// 2D array
var matrix [3][3]int
matrix[0][0] = 1

// Initialize 2D array
matrix := [3][3]int{
    {1, 2, 3},
    {4, 5, 6},
    {7, 8, 9},
}
\`\`\``
          },
          {
            heading: 'Slices',
            content: `Slices are dynamic arrays in Go. They're more commonly used than arrays.

**Slice Declaration:**

\`\`\`go
// Empty slice
var slice []int

// Slice with initial values
slice := []int{1, 2, 3, 4, 5}

// Slice from array
arr := [5]int{1, 2, 3, 4, 5}
slice := arr[1:4] // [2, 3, 4]

// Using make
slice := make([]int, 5)        // length 5, capacity 5
slice := make([]int, 5, 10)   // length 5, capacity 10
\`\`\`

**Slice Operations:**

\`\`\`go
// Append elements
slice := []int{1, 2, 3}
slice = append(slice, 4, 5)

// Slice length and capacity
length := len(slice)
capacity := cap(slice)

// Copy slice
src := []int{1, 2, 3}
dst := make([]int, len(src))
copy(dst, src)
\`\`\`

**Slice Slicing:**

\`\`\`go
slice := []int{0, 1, 2, 3, 4, 5}
slice[1:4]  // [1, 2, 3]
slice[:3]   // [0, 1, 2]
slice[3:]   // [3, 4, 5]
slice[:]    // [0, 1, 2, 3, 4, 5] (full slice)
\`\`\``
          },
          {
            heading: 'Working with Slices',
            content: `**Iterating Slices:**

\`\`\`go
slice := []int{1, 2, 3, 4, 5}

// Range loop
for index, value := range slice {
    fmt.Printf("Index: %d, Value: %d\\n", index, value)
}

// Only index
for i := range slice {
    fmt.Println(slice[i])
}

// Only value
for _, value := range slice {
    fmt.Println(value)
}
\`\`\`

**Common Slice Operations:**

\`\`\`go
// Check if slice is empty
if len(slice) == 0 {
    fmt.Println("Slice is empty")
}

// Remove element (by creating new slice)
func remove(slice []int, index int) []int {
    return append(slice[:index], slice[index+1:]...)
}

// Insert element
func insert(slice []int, index int, value int) []int {
    return append(slice[:index], append([]int{value}, slice[index:]...)...)
}
\`\`\``
          }
        ]
      }
    },
    {
      title: 'Go Maps',
      slug: 'go-maps',
      description: 'Learn about maps (key-value pairs) in Go',
      difficulty: 'beginner',
      order: 3,
      parentSlug: 'go-basics',
      article: {
        sections: [
          {
            heading: 'Map Basics',
            content: `Maps are Go's built-in associative data type (hash table/dictionary).

**Map Declaration:**

\`\`\`go
// Empty map
var m map[string]int

// Initialize with make
m := make(map[string]int)

// Initialize with values
m := map[string]int{
    "apple":  5,
    "banana": 3,
    "orange": 2,
}
\`\`\`

**Map Operations:**

\`\`\`go
// Add/Update
m["apple"] = 10

// Get value
value := m["apple"]

// Check if key exists
value, exists := m["apple"]
if exists {
    fmt.Println("Apple:", value)
}

// Delete key
delete(m, "apple")

// Map length
length := len(m)
\`\`\``
          },
          {
            heading: 'Iterating Maps',
            content: `**Range Loop:**

\`\`\`go
m := map[string]int{
    "apple":  5,
    "banana": 3,
}

// Iterate map
for key, value := range m {
    fmt.Printf("%s: %d\\n", key, value)
}

// Only keys
for key := range m {
    fmt.Println(key)
}
\`\`\`

**Map Patterns:**

\`\`\`go
// Count occurrences
func countWords(words []string) map[string]int {
    counts := make(map[string]int)
    for _, word := range words {
        counts[word]++
    }
    return counts
}

// Group by
func groupByLength(words []string) map[int][]string {
    groups := make(map[int][]string)
    for _, word := range words {
        length := len(word)
        groups[length] = append(groups[length], word)
    }
    return groups
}
\`\`\``
          }
        ]
      }
    },
    {
      title: 'Go Structs',
      slug: 'go-structs',
      description: 'Learn about structs, methods, and object-oriented programming in Go',
      difficulty: 'intermediate',
      order: 4,
      parentSlug: 'go-basics',
      article: {
        sections: [
          {
            heading: 'Struct Declaration',
            content: `Structs are collections of fields. They're Go's way of grouping related data.

**Basic Struct:**

\`\`\`go
// Define struct
type Person struct {
    Name string
    Age  int
    City string
}

// Create struct instance
person := Person{
    Name: "Alice",
    Age:  30,
    City: "New York",
}

// Access fields
fmt.Println(person.Name)
person.Age = 31
\`\`\`

**Anonymous Structs:**

\`\`\`go
// Inline struct
person := struct {
    Name string
    Age  int
}{
    Name: "Bob",
    Age:  25,
}
\`\`\`

**Nested Structs:**

\`\`\`go
type Address struct {
    Street string
    City   string
}

type Person struct {
    Name    string
    Address Address
}

person := Person{
    Name: "Charlie",
    Address: Address{
        Street: "123 Main St",
        City:   "Boston",
    },
}
\`\`\``
          },
          {
            heading: 'Methods',
            content: `Methods are functions with a special receiver argument.

**Method Declaration:**

\`\`\`go
type Rectangle struct {
    Width  float64
    Height float64
}

// Value receiver
func (r Rectangle) Area() float64 {
    return r.Width * r.Height
}

// Pointer receiver (can modify struct)
func (r *Rectangle) Scale(factor float64) {
    r.Width *= factor
    r.Height *= factor
}

// Usage
rect := Rectangle{Width: 10, Height: 5}
area := rect.Area()
rect.Scale(2)
\`\`\`

**Method Sets:**

\`\`\`go
// Value receiver - works with both value and pointer
func (r Rectangle) ValueMethod() {}

// Pointer receiver - works with both value and pointer
func (r *Rectangle) PointerMethod() {}

rect := Rectangle{}
rect.ValueMethod()    // OK
rect.PointerMethod()  // OK

ptr := &Rectangle{}
ptr.ValueMethod()     // OK
ptr.PointerMethod()   // OK
\`\`\``
          },
          {
            heading: 'Embedding',
            content: `Go supports embedding structs to achieve composition.

\`\`\`go
type Animal struct {
    Name string
}

func (a Animal) Speak() {
    fmt.Println(a.Name, "makes a sound")
}

type Dog struct {
    Animal  // Embedded struct
    Breed   string
}

// Usage
dog := Dog{
    Animal: Animal{Name: "Buddy"},
    Breed:  "Golden Retriever",
}
dog.Speak()  // Can call embedded method
\`\`\``
          }
        ]
      }
    },
    {
      title: 'Go Interfaces',
      slug: 'go-interfaces',
      description: 'Learn about interfaces and polymorphism in Go',
      difficulty: 'intermediate',
      order: 5,
      parentSlug: 'go-basics',
      article: {
        sections: [
          {
            heading: 'Interface Basics',
            content: `Interfaces define behavior. A type implements an interface by implementing its methods.

**Interface Declaration:**

\`\`\`go
// Define interface
type Shape interface {
    Area() float64
    Perimeter() float64
}

// Types implement interface implicitly
type Rectangle struct {
    Width  float64
    Height float64
}

func (r Rectangle) Area() float64 {
    return r.Width * r.Height
}

func (r Rectangle) Perimeter() float64 {
    return 2 * (r.Width + r.Height)
}

type Circle struct {
    Radius float64
}

func (c Circle) Area() float64 {
    return 3.14159 * c.Radius * c.Radius
}

func (c Circle) Perimeter() float64 {
    return 2 * 3.14159 * c.Radius
}

// Function accepting interface
func printArea(s Shape) {
    fmt.Println("Area:", s.Area())
}
\`\`\``
          },
          {
            heading: 'Empty Interface',
            content: `The empty interface \`interface{}\` can hold values of any type.

\`\`\`go
// Accept any type
func printValue(v interface{}) {
    fmt.Println(v)
}

// Type assertion
func processValue(v interface{}) {
    if str, ok := v.(string); ok {
        fmt.Println("String:", str)
    } else if num, ok := v.(int); ok {
        fmt.Println("Number:", num)
    }
}

// Type switch
func typeSwitch(v interface{}) {
    switch v := v.(type) {
    case string:
        fmt.Println("String:", v)
    case int:
        fmt.Println("Int:", v)
    default:
        fmt.Println("Unknown type")
    }
}
\`\`\``
          }
        ]
      }
    },
    {
      title: 'Go Concurrency - Goroutines',
      slug: 'go-goroutines',
      description: 'Learn about goroutines and concurrent programming in Go',
      difficulty: 'advanced',
      order: 6,
      parentSlug: 'go-basics',
      article: {
        sections: [
          {
            heading: 'Goroutines',
            content: `Goroutines are lightweight threads managed by the Go runtime.

**Starting Goroutines:**

\`\`\`go
// Simple goroutine
go func() {
    fmt.Println("Running in goroutine")
}()

// Function as goroutine
func sayHello() {
    fmt.Println("Hello from goroutine")
}
go sayHello()

// Wait for goroutine (using sync.WaitGroup)
var wg sync.WaitGroup
wg.Add(1)
go func() {
    defer wg.Done()
    fmt.Println("Goroutine finished")
}()
wg.Wait()
\`\`\`

**Goroutine Communication:**

\`\`\`go
// Using channels
ch := make(chan string)

go func() {
    ch <- "Hello"
}()

message := <-ch
fmt.Println(message)
\`\`\``
          },
          {
            heading: 'Channels',
            content: `Channels are typed conduits for communication between goroutines.

**Channel Operations:**

\`\`\`go
// Create channel
ch := make(chan int)        // Unbuffered
ch := make(chan int, 10)    // Buffered (capacity 10)

// Send
ch <- 42

// Receive
value := <-ch

// Close channel
close(ch)

// Check if closed
value, ok := <-ch
if !ok {
    fmt.Println("Channel closed")
}
\`\`\`

**Channel Patterns:**

\`\`\`go
// Range over channel
for value := range ch {
    fmt.Println(value)
}

// Select statement (like switch for channels)
select {
case msg1 := <-ch1:
    fmt.Println("Received from ch1:", msg1)
case msg2 := <-ch2:
    fmt.Println("Received from ch2:", msg2)
case <-time.After(1 * time.Second):
    fmt.Println("Timeout")
default:
    fmt.Println("No message ready")
}
\`\`\``
          }
        ]
      }
    },
    {
      title: 'Go Error Handling',
      slug: 'go-error-handling',
      description: 'Learn about error handling patterns in Go',
      difficulty: 'intermediate',
      order: 7,
      parentSlug: 'go-basics',
      article: {
        sections: [
          {
            heading: 'Error Interface',
            content: `Go uses the \`error\` interface for error handling.

**Error Interface:**

\`\`\`go
type error interface {
    Error() string
}
\`\`\`

**Creating Errors:**

\`\`\`go
import "errors"
import "fmt"

// Simple error
err := errors.New("something went wrong")

// Formatted error
err := fmt.Errorf("invalid value: %d", value)

// Custom error type
type MyError struct {
    Code    int
    Message string
}

func (e *MyError) Error() string {
    return fmt.Sprintf("Error %d: %s", e.Code, e.Message)
}
\`\`\`

**Error Handling:**

\`\`\`go
// Check error
result, err := doSomething()
if err != nil {
    return err
}

// Multiple return values
value, err := getValue()
if err != nil {
    log.Fatal(err)
}
\`\`\``
          },
          {
            heading: 'Error Wrapping',
            content: `Go 1.13+ supports error wrapping.

\`\`\`go
import "fmt"

// Wrap error
if err != nil {
    return fmt.Errorf("operation failed: %w", err)
}

// Unwrap error
import "errors"

if errors.Is(err, targetErr) {
    // Error matches
}

var targetErr *MyError
if errors.As(err, &targetErr) {
    // Error is of type MyError
}
\`\`\``
          }
        ]
      }
    },
    {
      title: 'Go Pointers',
      slug: 'go-pointers',
      description: 'Learn about pointers and memory management in Go',
      difficulty: 'intermediate',
      order: 8,
      parentSlug: 'go-basics',
      article: {
        sections: [
          {
            heading: 'Pointer Basics',
            content: `Pointers hold the memory address of a value.

**Pointer Operations:**

\`\`\`go
// Get address
x := 42
ptr := &x  // ptr is *int

// Dereference
value := *ptr

// Pointer to struct
type Person struct {
    Name string
    Age  int
}

p := Person{Name: "Alice", Age: 30}
ptr := &p
ptr.Name = "Bob"  // Same as (*ptr).Name
\`\`\`

**Pointer Parameters:**

\`\`\`go
// Pass by value (copy)
func modifyValue(x int) {
    x = 100  // Doesn't affect original
}

// Pass by reference (pointer)
func modifyPointer(x *int) {
    *x = 100  // Modifies original
}

value := 42
modifyValue(value)   // value is still 42
modifyPointer(&value) // value is now 100
\`\`\``
          },
          {
            heading: 'Nil Pointers',
            content: `Pointers can be nil (zero value).

\`\`\`go
var ptr *int  // nil

// Check for nil
if ptr != nil {
    fmt.Println(*ptr)
}

// Safe dereference
if ptr != nil {
    value := *ptr
}
\`\`\``
          }
        ]
      }
    },
    {
      title: 'Go Packages and Modules',
      slug: 'go-packages-modules',
      description: 'Learn about Go packages, modules, and project organization',
      difficulty: 'intermediate',
      order: 9,
      parentSlug: 'go-basics',
      article: {
        sections: [
          {
            heading: 'Packages',
            content: `Every Go file belongs to a package.

**Package Declaration:**

\`\`\`go
package main  // Executable package

import "fmt"
import "math"

// Multiple imports
import (
    "fmt"
    "math"
    "strings"
)
\`\`\`

**Creating Packages:**

\`\`\`go
// mathutil/mathutil.go
package mathutil

func Add(a, b int) int {
    return a + b
}

func Multiply(a, b int) int {
    return a * b
}
\`\`\`

**Using Packages:**

\`\`\`go
import "mathutil"

result := mathutil.Add(3, 4)
\`\`\``
          },
          {
            heading: 'Modules',
            content: `Go modules manage dependencies.

**Initialize Module:**

\`\`\`bash
go mod init example.com/myproject
\`\`\`

**go.mod file:**

\`\`\`go
module example.com/myproject

go 1.21

require (
    github.com/example/package v1.0.0
)
\`\`\`

**Common Commands:**

\`\`\`bash
go mod init          # Initialize module
go mod tidy          # Add/remove dependencies
go mod download      # Download dependencies
go mod vendor        # Create vendor directory
\`\`\``
          }
        ]
      }
    },
    {
      title: 'Go Standard Library',
      slug: 'go-standard-library',
      description: 'Explore important packages from Go standard library',
      difficulty: 'intermediate',
      order: 10,
      parentSlug: 'go-basics',
      article: {
        sections: [
          {
            heading: 'Common Packages',
            content: `**fmt - Formatting:**

\`\`\`go
import "fmt"

fmt.Print("Hello")
fmt.Println("World")
fmt.Printf("Value: %d\\n", 42)
\`\`\`

**strings - String Operations:**

\`\`\`go
import "strings"

strings.Contains("hello", "ell")
strings.HasPrefix("hello", "he")
strings.Split("a,b,c", ",")
strings.Join([]string{"a", "b"}, ",")
\`\`\`

**os - Operating System:**

\`\`\`go
import "os"

os.Getenv("PATH")
os.Exit(1)
\`\`\`

**time - Time Operations:**

\`\`\`go
import "time"

now := time.Now()
duration := time.Second * 5
time.Sleep(duration)
\`\`\`

**sort - Sorting:**

\`\`\`go
import "sort"

nums := []int{3, 1, 4, 1, 5}
sort.Ints(nums)
\`\`\``
          }
        ]
      }
    }
  ];

  // Create concepts
  for (const conceptData of goConcepts) {
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
    
    console.log(`✅ Created: ${conceptData.title}`);
  }

  console.log('\n🎉 Go concepts added successfully!');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

