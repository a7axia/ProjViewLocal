// src/ProjectDetails.js
import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "./firebase";
import './ProjectDetails.css'; // Import the CSS for styling

const ProjectDetails = ({ projectId, onClose, refreshProjects }) => {
    const [project, setProject] = useState(null); // State to hold project details
    const [username, setUsername] = useState(""); // State for username
    const [comment, setComment] = useState(""); // State for comment
    const [selectedStatus, setSelectedStatus] = useState(""); // State for selected status
    const [projectLead, setProjectLead] = useState(""); // State for project lead
    const [category, setCategory] = useState(""); // State for category
    const [projectName, setProjectName] = useState(""); // State for project name
    const [dueDate, setDueDate] = useState(""); // State for due date
    const [description, setDescription] = useState(""); // State for project description
    const [todos, setTodos] = useState([]); // State for to-do list
    const [newTodo, setNewTodo] = useState(""); // State for new to-do item
    const [oneDriveUrl, setOneDriveUrl] = useState(""); // State for OneDrive URL
    const [notes, setNotes] = useState([]); // State for notes
    const [newNote, setNewNote] = useState(""); // State for new note
    const [file, setFile] = useState(null); // State for file attachment
    const [editingNoteIndex, setEditingNoteIndex] = useState(null); // State for editing note index
    const [editedNoteText, setEditedNoteText] = useState(""); // State for edited note text
    

    useEffect(() => {
        const fetchProjectDetails = async () => {
            const docRef = doc(db, "projects", projectId); // Use projectId prop
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const projectData = docSnap.data();
                setProject({ id: docSnap.id, ...projectData });
                setProjectName(projectData.title || ""); // Set initial project name
                setProjectLead(projectData.lead || ""); // Set initial project lead
                setDescription(projectData.description || "");
                setSelectedStatus(projectData.status || "New");
                setCategory(projectData.category || "Code");
                setDueDate(projectData.dueDate || "");
                setTodos(projectData.todos || []);
                setOneDriveUrl(projectData.oneDriveUrl || "");
                setNotes(projectData.notes || []);
            } else {
                console.error("No such document!");
            }
        };

        fetchProjectDetails();
    }, [projectId]);

    const updateProject = async (updatedData) => {
        const docRef = doc(db, "projects", projectId);
        await updateDoc(docRef, updatedData);
        const updatedDocSnap = await getDoc(docRef);
        setProject({ id: updatedDocSnap.id, ...updatedDocSnap.data() });
    };

    const handleTodoChange = (index, value) => {
        const updatedTodos = [...todos];
        updatedTodos[index] = value;
        setTodos(updatedTodos);
    };

    const addTodo = () => {
        if (newTodo.trim()) {
            setTodos([...todos, newTodo]);
            setNewTodo("");
        }
    };

    const removeTodo = (index) => {
        const updatedTodos = todos.filter((_, i) => i !== index);
        setTodos(updatedTodos);
    };

    const handleCompleteTask = () => {
        alert("Task marked as complete!");
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (username.trim() && comment.trim()) {
            const docRef = doc(db, "projects", projectId);
            await updateDoc(docRef, {
                comments: arrayUnion({ username, comment })
            });
            setComment("");
            setUsername("");
            const updatedDocSnap = await getDoc(docRef);
            setProject({ id: updatedDocSnap.id, ...updatedDocSnap.data() });
            refreshProjects();
        }
    };

    const closeModal = () => {
        const updatedData = {
            title: projectName,
            lead: projectLead,
            status: selectedStatus,
            category: category,
            dueDate: dueDate,
            description: description,
            todos: todos,
            oneDriveUrl: oneDriveUrl,
        };
        updateProject(updatedData);
        onClose();
        refreshProjects();
        document.body.classList.remove("modal-open");
    };

    const handleProjectUpdate = () => {
        const updatedData = {
            title: projectName,
            lead: projectLead,
            status: selectedStatus,
            category: category,
            dueDate: dueDate,
            description: description,
            todos: todos,
            oneDriveUrl: oneDriveUrl,
        };
        updateProject(updatedData);
    };

    const handleAddNote = async () => {
        let fileUrl = null;
        let fileName = null;
        if (file) {
            const storageRef = ref(storage, `notes/${file.name}`);
            await uploadBytes(storageRef, file);
            fileUrl = await getDownloadURL(storageRef);
            fileName = file.name;
        }

        const newNoteObj = { text: newNote, fileUrl, fileName, timestamp: new Date().toISOString() };
        const docRef = doc(db, "projects", projectId);
        await updateDoc(docRef, {
            notes: arrayUnion(newNoteObj)
        });
        setNotes([...notes, newNoteObj]);
        setNewNote("");
        setFile(null);
    };

    const handleDeleteNote = async (noteToDelete) => {
        const updatedNotes = notes.filter(note => note !== noteToDelete);
        const docRef = doc(db, "projects", projectId);
        await updateDoc(docRef, {
            notes: updatedNotes
        });
        setNotes(updatedNotes);
    };

    const handleEditNote = (index) => {
        setEditingNoteIndex(index);
        setEditedNoteText(notes[index].text);
    };

    const handleSaveNote = async (index) => {
        const updatedNotes = [...notes];
        updatedNotes[index].text = editedNoteText;
        const docRef = doc(db, "projects", projectId);
        await updateDoc(docRef, {
            notes: updatedNotes
        });
        setNotes(updatedNotes);
        setEditingNoteIndex(null);
        setEditedNoteText("");
    };

    if (!project) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <div className="modal-overlay" onClick={closeModal}></div>
            <div className="modal">
                <span className="close" onClick={closeModal}>&times;</span>
                <div className="modal right-slide-modal">
                    <div className="modal-content">
                        <span className="close" onClick={() => { onClose(); refreshProjects(); }}>&times;</span>
                        <h2>{project.title}</h2>
                        <div className="status-priority">
                            <div className="Status">
                                <label>Status:</label>
                                <span className="status-tag">{selectedStatus}</span>
                            </div>
                            <div className="Category">
                                <label>Category:</label>
                                <span className="priority-tag">{category}</span>
                            </div>
                        </div>
                        <div className="dates">
                            <p>Date Created: {new Date(project.createdAt.toDate()).toLocaleString()}</p>
                            <div className="due-date">
                                <label>Due Date:</label>
                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="description-section">
                            <label>Description:</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Add a description for this task!"
                            />
                        </div>
                        {/* Notes Section */}
                        <div>
                            <h3>Notes:</h3>
                            <ul>
                                {notes.map((note, index) => (
                                    <li key={index}>
                                        <span className="note-dot" title={new Date(note.timestamp).toLocaleString()}></span>
                                        {editingNoteIndex === index ? (
                                            <textarea
                                                value={editedNoteText}
                                                onChange={(e) => setEditedNoteText(e.target.value)}
                                                rows="2"
                                                cols="50"
                                            />
                                        ) : (
                                            note.text
                                        )}
                                        {note.fileUrl && (
                                            <a href={note.fileUrl} target="_blank" rel="noopener noreferrer">
                                                {note.fileName}
                                            </a>
                                        )}
                                        <button
                                            title={new Date(note.timestamp).toLocaleString()}
                                            onClick={() => handleEditNote(index)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                                        >
                                            📝
                                        </button>
                                        {editingNoteIndex === index ? (
                                            <button onClick={() => handleSaveNote(index)}>Save</button>
                                        ) : (
                                        <button
                                            onClick={() => handleDeleteNote(note)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                                        >
                                            ❌
                                        </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                            <textarea
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                placeholder="Add a note"
                                rows="4"
                                cols="50"
                            />
                            <input
                                type="file"
                                onChange={(e) => setFile(e.target.files[0])}
                            />
                            <button onClick={handleAddNote}>Add Note</button>
                        </div>

                        <div className="onedrive-section">
                            <label>OneDrive URL:</label>
                            <input
                                type="text"
                                value={oneDriveUrl}
                                onChange={(e) => setOneDriveUrl(e.target.value)}
                                placeholder="Add a OneDrive URL for this task!"
                            />
                        </div>

                        <div className="todo-section">
                            <label>To-do:</label>
                            {todos.map((todo, index) => (
                                <div className="todo-item" key={index}>
                                    <input
                                        type="checkbox"
                                    />
                                    <input
                                        type="text"
                                        value={todo}
                                        onChange={(e) => handleTodoChange(index, e.target.value)}
                                        placeholder="Add info to this Todo..."
                                    />
                                    <button className="remove-todo" onClick={() => removeTodo(index)}>-</button>
                                </div>
                            ))}
                            <div className="add-todo">
                                <input
                                    type="text"
                                    value={newTodo}
                                    onChange={(e) => setNewTodo(e.target.value)}
                                    placeholder="Add info to this Todo..."
                                />
                                <button onClick={addTodo}>+</button>
                            </div>
                        </div>

                        <div className="comments-section">
                            <h4>Comments</h4>
                            <ul>
                                {project.comments && project.comments.map((c, index) => (
                                    <li key={index}><strong>{c.username}:</strong> {c.comment}</li>
                                ))}
                            </ul>

                            <form onSubmit={handleCommentSubmit}>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Your Name"
                                    required
                                />
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Your Comment"
                                    required
                                />
                                <button type="submit">Submit Comment</button>
                            </form>
                        </div>
                        {/* Project Name Field */}
                        <div className="project-name-section">
                            <label>Project Name:</label>
                            <input
                                type="text"
                                value={projectName}
                                onChange={(e) => {
                                    setProjectName(e.target.value);
                                    handleProjectUpdate(); // Update on change
                                }}
                            />
                        </div>

                        {/* Project Lead Field */}
                        <div className="project-lead-section">
                            <label>Project Lead:</label>
                            <input
                                type="text"
                                value={projectLead}
                                onChange={(e) => {
                                    setProjectLead(e.target.value);
                                    handleProjectUpdate(); // Update on change
                                }}
                            />
                        </div>

                        {/* Status Dropdown */}
                        <div className="status-section">
                            <label>Status:</label>
                            <select
                                value={selectedStatus}
                                onChange={(e) => {
                                    setSelectedStatus(e.target.value);
                                    handleProjectUpdate(); // Update on change
                                }}
                            >
                                <option value="New">New</option>
                                <option value="Active">Active</option>
                                <option value="Hold">Hold</option>
                                <option value="End">End</option>
                            </select>
                        </div>

                        {/* Category Dropdown */}
                        <div className="category-section">
                            <label>Category:</label>
                            <select
                                value={category}
                                onChange={(e) => {
                                    setCategory(e.target.value);
                                    handleProjectUpdate(); // Update on change
                                }}
                            >
                                <option value="Code">Code</option>
                                <option value="Business">Business</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProjectDetails;
