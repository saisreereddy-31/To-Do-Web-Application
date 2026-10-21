
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskDate = document.getElementById("taskDate");
const taskTime = document.getElementById("taskTime");
const taskList = document.getElementById("taskList");
const submitBtn = document.getElementById("submitBtn");
const emptyMessage = document.getElementById("emptyMessage");

let tasks = JSON.parse(localStorage.getItem("myTasks")) || [];
let currentFilter = "all";
let editingId = null;

function saveTasks() {
    localStorage.setItem("myTasks", JSON.stringify(tasks));
}

function addTask(event) {
    event.preventDefault();

    const title = taskInput.value.trim();

    if (!title) {
        alert("Please enter a task!");
        return;
    }

    if (editingId !== null) {
        const task = tasks.find(task => task.id === editingId);

        if (task) {
            task.title = title;
            task.date = taskDate.value;
            task.time = taskTime.value;
        }

        editingId = null;
        submitBtn.textContent = "Add Task";
    } else {
        tasks.push({
            id: Date.now(),
            title: title,
            date: taskDate.value,
            time: taskTime.value,
            completed: false
        });
    }

    saveTasks();
    taskForm.reset();
    renderTasks();
}

function renderTasks() {
    taskList.innerHTML = "";

    let filteredTasks = tasks.filter(task => {
        if (currentFilter === "pending") {
            return !task.completed;
        }

        if (currentFilter === "completed") {
            return task.completed;
        }

        return true;
    });

    filteredTasks.sort((a, b) => {
        if (a.date && b.date && a.date !== b.date) {
            return a.date.localeCompare(b.date);
        }

        if (a.date && !b.date) return -1;
        if (!a.date && b.date) return 1;

        return (a.time || "").localeCompare(b.time || "");
    });

    filteredTasks.forEach(task => {
        const li = document.createElement("li");
        li.className = "task" + (task.completed ? " done" : "");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-check";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", "Mark task completed");

        checkbox.addEventListener("change", () => {
            task.completed = checkbox.checked;
            saveTasks();
            renderTasks();
        });

        const info = document.createElement("div");
        info.className = "task-info";

        const title = document.createElement("p");
        title.className = "task-title";
        title.textContent = task.title;

        info.appendChild(title);

        if (task.date || task.time) {
            const date = document.createElement("span");
            date.className = "task-date";

            let details = "";

            if (task.date) {
                details += task.date;
            }

            if (task.time) {
                details += (details ? " at " : "") + task.time;
            }

            date.textContent = "📅 " + details;
            info.appendChild(date);
        }

        const actions = document.createElement("div");
        actions.className = "task-actions";

        const editBtn = document.createElement("button");
        editBtn.className = "edit-btn";
        editBtn.textContent = "Edit";

        editBtn.addEventListener("click", () => {
            taskInput.value = task.title;
            taskDate.value = task.date;
            taskTime.value = task.time;

            editingId = task.id;
            submitBtn.textContent = "Save Changes";
            taskInput.focus();
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "Delete";

        deleteBtn.addEventListener("click", () => {
            tasks = tasks.filter(item => item.id !== task.id);

            if (editingId === task.id) {
                editingId = null;
                taskForm.reset();
                submitBtn.textContent = "Add Task";
            }

            saveTasks();
            renderTasks();
        });

        actions.append(editBtn, deleteBtn);
        li.append(checkbox, info, actions);
        taskList.appendChild(li);
    });

    emptyMessage.style.display =
        filteredTasks.length === 0 ? "block" : "none";

    document.getElementById("totalTasks").textContent =
        `${tasks.length} task${tasks.length !== 1 ? "s" : ""}`;

    const completed = tasks.filter(task => task.completed).length;

    document.getElementById("completedTasks").textContent =
        `${completed} completed`;
}

taskForm.addEventListener("submit", addTask);

document.querySelectorAll(".filter").forEach(button => {
    button.addEventListener("click", () => {
        currentFilter = button.dataset.filter;

        document.querySelectorAll(".filter").forEach(item => {
            item.classList.toggle("active", item === button);
        });

        renderTasks();
    });
});

renderTasks();
