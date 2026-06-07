import "./styles/style.css";

import crossIcon from "./images/icon-cross.svg";
import checkIcon from "./images/icon-check.svg";
import { useEffect, useState } from "react";
import sunIcon from "./images/icon-sun.svg";
import moonIcon from "./images/icon-moon.svg";

function ToDoApp() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");
  const [filter, setFilter] = useState("all");
  const [darkMode, setDarkMode] = useState(false);

  const icon = darkMode ? sunIcon : moonIcon;

  function changeTheme() {
    setDarkMode(!darkMode);
  }

  function removeTodo(id) {
    setTodos(todos.filter((todo) => todo.id !== id));
    deleteData(id);
  }

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  const activeTodos = todos.filter((todo) => {
    return !todo.completed;
  });

  function ClearCompleted() {
    setTodos(todos.filter((todo) => todo.completed === false));
    deleteCompletedTasks();
  }

  function handleSubmit(e) {
    if (e) e.preventDefault(); // Stop native HTML form submission reload

    const trimmedText = text.trim();
    if (!trimmedText) return;

    const isDuplicate = todos.some(
      (todo) => todo.text.toLowerCase() === trimmedText.toLowerCase(),
    );

    if (isDuplicate) {
      alert("This task already exists!");
      return;
    }

    const todoToSend = {
      text: trimmedText,
      completed: false,
      date: Date.now(),
    };
    addTodo(todoToSend);
    setText("");
  }

  function toggleTodo(e, id) {
    if (e) e.stopPropagation(); // Stop checkbox from bubbling click events up to form wrappers

    const selectedTodo = todos.find((todo) => todo.id === id);
    if (!selectedTodo) return;

    const nextStatus = !selectedTodo.completed;

    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: nextStatus } : todo,
      ),
    );
    changeData(id, nextStatus);
  }

  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  function handleDragStart(index) {
    setDragIndex(index);
  }

  function handleDragOver(e, index) {
    e.preventDefault(); 
    setDragOverIndex(index);
  }

  function handleDrop(index) {
    if (dragIndex === null || dragIndex === index) return;

    const reordered = [...todos];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(index, 0, moved);
    setTodos(reordered);

    setDragIndex(null);
    setDragOverIndex(null);
  }

  function handleDragEnd() {
    setDragIndex(null);
    setDragOverIndex(null);
  }

  async function getData() {
    try {
      const response = await fetch("http://localhost:3001/tasks");

      if (!response.ok) {
        console.error(`error status: ${response.status}`);
        return;
      }

      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error("error is ", error);
    }
  }

  async function addTodo(todo) {
    try {
      const response = await fetch("http://localhost:3001/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(todo),
      });

      if (!response.ok) {
        console.error(`error status:${response.status}`);
        return;
      }

      const savedTodoFromServer = await response.json();
      setTodos([...todos, savedTodoFromServer]);
    } catch (error) {
      console.error("error is:", error);
    }
  }

  async function deleteData(id) {
    try {
      const response = await fetch(`http://localhost:3001/tasks/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        console.error("error status:", response.status);
        return;
      }

      await response.json();
    } catch (error) {
      console.error("Network or parsing failure:", error);
    }
  }

  async function changeData(id, nextStatus) {
    try {
      const response = await fetch(`http://localhost:3001/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: nextStatus }),
      });

      if (!response.ok) {
        console.error("error staus:", response.status);
        return;
      }

      await response.json();
    } catch (error) {
      console.error("failed to toggle todo status:", error);
    }
  }

  async function deleteCompletedTasks() {
    try {
      const response = await fetch("http://localhost:3001/tasks", {
        method: "GET",
      });

      if (!response.ok) {
        console.error("error status:", response.status);
        return;
      }

      const allTasks = await response.json();
      const completedTasks = allTasks.filter((task) => task.completed === true);

      const deletePromise = completedTasks.map((task) => deleteData(task.id));
      await Promise.all(deletePromise);
    } catch (error) {
      console.error("Failed to clear completed tasks:", error);
    }
  }

  useEffect(() => {
    getData();
  }, []);

  return (
    <div data-theme={darkMode} className="h-screen relative font-josefinSans">
      <div
        className={`block w-screen h-auto inset-0 -z-10 fixed bg-contain bg-no-repeat   
                bg-[image:var(--mobile-bg)] 
                md:bg-[image:var(--desktop-bg)]`}
      ></div>
      <div
        className="fixed w-full h-full -z-12"
        style={{ backgroundColor: `var(--main-bg)` }}
      ></div>
      <div className="h-screen z-10 m-8 flex flex-col items-center ">
        <main
          className="w-full font-josefinSans flex flex-col text-[var(--Dark-Grayish-Blue)] gap-4 text-[1rem] 
                       sm:max-w-[min(90%,690px)] md:max-w-[70%] lg:max-w-[60%] xl:max-w-[50%] "
        >
          <header className="text-white w-full flex items-center !justify-between mb-12 ">
            <h1 className="text-[2rem] tracking-[5px] font-extrabold color-[var(--primary-text)] ">
              TODO
            </h1>
            <img
              className="size-[25px] cursor-pointer"
              src={icon}
              alt="icon"
              onClick={() => changeTheme()}
            />
          </header>

          {/* Form container handles submission cleanly */}
          <form
            onSubmit={handleSubmit}
            className="flex w-full gap-[20px] items-center bg-[var(--container-bg)] rounded-[5px] p-4 box-border"
          >
            <span className="border-[0.1px] border-[var(--Light-Grayish-Blue2)] rounded-full size-[23px] "></span>
            <input
              className="caret-blue-500 w-full text-[var(--second-text)] text-[1.125rem] pt-0.5 placeholder-[var(hsl(233, 11%, 84%))] align-middle bg-transparent outline-none"
              placeholder="Create a new todo..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </form>

          {/* todos container*/}
          <div className="rounded-[5px] bg-[var(--container-bg)] shadow-lg shadow-[color:var(--shadow)]">
            {filteredTodos.map((item, index) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={() => handleDrop(index)}
                onDragEnd={handleDragEnd}
                className={`overflow-scroll flex-wrap text-[1.125rem] flex 
                  items-center border-b-[1px] border-[var(--Light-Grayish-Blue2)] 
                  justify-between w-full p-[1rem] cursor-grab active:cursor-grabbing
                  transition-all duration-150
                  ${
                    dragOverIndex === index && dragIndex !== index
                      ? "border-t-2 border-t-[var(--Bright-Blue)]"
                      : ""
                  }
                  ${dragIndex === index ? "opacity-40" : "opacity-100"}
                `}
              >
                <div className="flex items-center">
                  <label className="relative w-full flex items-center justify-center cursor-pointer gap-[15px]">
                    <input
                      type="checkbox"
                      className="absolute opacity-0 w-0 h-0 peer "
                      onChange={(e) => toggleTodo(e, item.id)}
                      checked={item.completed}
                    />
                    <span
                      className={`
                                        size-[23px] rounded-[100%] 
                                        ${
                                          item.completed
                                            ? "border-none"
                                            : "gradient-border-hover border-[0.1px]"
                                        }
                                        border-[var(--Light-Grayish-Blue2)] peer-checked:bg-gradient-to-br peer-checked:from-[hsl(192,100%,67%)]
                                         peer-checked:to-[hsl(280,87%,65%)]
                                        peer-checked:border-transparent 
                                        flex items-center justify-center transition-all duration-200
                                        `}
                    >
                      <img
                        src={checkIcon}
                        alt="Check mark"
                        className={`min-size-3 roubnde ${
                          item.completed ? "opacity-100" : "opacity-0"
                        }`}
                      />
                    </span>
                    <span
                      className={`relative top-[2px] align-bottom text-[var(--primary-text)]   
                                                  whitespace-normal break-words 
                                                  ${
                                                    item.completed
                                                      ? `!line-through !text-[var(--border-color)]`
                                                      : ``
                                                  } `}
                    >
                      {item.text}
                    </span>
                  </label>
                </div>
                <button
                  type="button"
                  className="cursor-pointer"
                  onClick={() => removeTodo(item.id)}
                >
                  <img src={crossIcon} alt="Delete" />
                </button>
              </div>
            ))}

            {/* Filters for Desktop*/}
            <div className="flex items-center justify-between w-full p-4">
              <div className="font-josefinSans text-[var(--Dark-Grayish-Blue)]">
                {activeTodos.length} items left
              </div>
              <div
                className="hidden font-bold bg-[var(--container-bg)] text-[var(--Dark-Grayish-Blue)]
                                         md:flex justify-center rounded-[5px] p-[10px] gap-4"
              >
                <button
                  type="button"
                  className={`cursor-pointer ${
                    filter === "all"
                      ? "text-[var(--Bright-Blue)]"
                      : " hover:text-[var(--primary-text)]"
                  }`}
                  onClick={() => setFilter("all")}
                >
                  All
                </button>
                <button
                  type="button"
                  className={`cursor-pointer ${
                    filter === "active"
                      ? "text-[var(--Bright-Blue)]"
                      : "hover:text-[var(--primary-text)]"
                  }`}
                  onClick={() => setFilter("active")}
                >
                  Active
                </button>
                <button
                  type="button"
                  className={`cursor-pointer ${
                    filter === "completed"
                      ? "text-[var(--Bright-Blue)]"
                      : "hover:text-[var(--primary-text)]"
                  }`}
                  onClick={() => setFilter("completed")}
                >
                  Completed
                </button>
              </div>
              <button
                type="button"
                className=" text-[var(text-[hsl(236,9%,61%)])] cursor-pointer pr-2 hover:text-[var(--primary-text)]"
                onClick={ClearCompleted}
              >
                Clear Completed
              </button>
            </div>
          </div>
        </main>

        {/* Filters for Mobile*/}
        <div
          className="md:hidden w-full shadow-lg shadow-[color:var(--shadow)] sm:max-w-[min(90%,690px)]
                        md:max-w-[70%] lg:max-w-[60%] xl:max-w-[50%] mt-4 font-bold bg-[var(--container-bg)] 
                        text-[var(--Dark-Grayish-Blue)] flex justify-center rounded-[5px] p-[10px] gap-4"
        >
          <button
            type="button"
            className={`cursor-pointer hover:text-[var(--primary-text)] ${
              filter === "all" ? "text-[var(--Bright-Blue)]" : ""
            }`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            type="button"
            className={`cursor-pointer hover:text-[var(--primary-text)] ${
              filter === "active" ? "text-[var(--Bright-Blue)]" : ""
            }`}
            onClick={() => setFilter("active")}
          >
            Active
          </button>
          <button
            type="button"
            className={`cursor-pointer hover:text-[var(--primary-text)] ${
              filter === "completed" ? "text-[var(--Bright-Blue)]" : ""
            }`}
            onClick={() => setFilter("completed")}
          >
            Completed
          </button>
        </div>
        <p className="font-josefinSans text-[var(--Dark-Grayish-Blue)] text-center mt-8 ">
          Drag and drop to reorder list
        </p>
      </div>
    </div>
  );
}

export default ToDoApp;