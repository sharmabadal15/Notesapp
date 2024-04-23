import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Image,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import { Textarea } from "@nextui-org/react";
import { Plus, Trash } from "react-feather";
import axios from "axios";
import { useAuth } from "../authentication/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Caard() {
  const { isOpen, onOpen, onOpenChange ,onClose} = useDisclosure();
  const { isLoggedIn, user, logout } = useAuth(); // Include logout function from useAuth
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [deletingNoteId, setDeletingNoteId] = useState(null); // State to track note being deleted
  const [editingNote, setEditingNote] = useState(null); // State to track the note being edited

  useEffect(() => {
    if (isLoggedIn && user) {
      fetchNotes();
    } else {
      setNotes([]); // Clear notes state when user logs out
    }
  }, [isLoggedIn, user]);

  const fetchNotes = async () => {
    try {
      const response = await axios.get(
        `https://notesapp-fvg3.vercel.app/notes/${user.id}`
      );
      setNotes(response.data);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  const addNote = async () => {
    try {
      await axios.post("https://notesapp-fvg3.vercel.app/notes", {
        user_id: user.id,
        title: "New Note",
        content: newNote,
      });
      setNewNote("");
      fetchNotes();
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };
  const handlePlusClick = () => {
    if (isLoggedIn) {
      onOpen();
    } else {
      navigate("/login");
    }
  };

  const deleteNote = async (noteId) => {
    try {
      console.log("Deleting note with ID:", noteId);
      await axios.delete(`https://notesapp-fvg3.vercel.app/notes/${noteId}`);
      setNotes(notes.filter((note) => note.id !== noteId)); // Remove the deleted note from the state
    } catch (error) {
      console.error("Error deleting note:", error);
    } finally {
      setDeletingNoteId(null); // Reset deletingNoteId after delete operation completes
    }
  };
  const editNote = (note) => {
    setEditingNote(note);
    setNewNote(note.content); // Pre-fill the textarea with the note's content
    onOpen(); // Open the modal
  };

  const saveEditedNote = async () => {
    try {
      await axios.put(`https://notesapp-fvg3.vercel.app/notes/${editingNote.id}`, {
        title: editingNote.title,
        content: newNote,
      });
      setEditingNote(null); // Reset editingNote state
      onClose(); // Close the modal
      fetchNotes(); // Fetch updated notes
    } catch (error) {
      console.error("Error editing note:", error);
    }
  };

  return (
    <>
      <div className="relative grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-10">
        {notes.map((notes, index) => (
          <Card key={index} className="py-1">
            <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
              <h1 className="text-large uppercase font-bold">Notes</h1>
              <h4 className="font-bold text-large"></h4>
            </CardHeader>
            <CardBody className="relative overflow-visible py-2">
              <div>
                <p>{notes.content}</p>
                <Button
                  isIconOnly
                  className="absolute bottom-4 right-5 text-white rounded-full p-1 shadow-md cursor-pointer"
                  onClick={() => deleteNote(notes.id)}
                >
                  <Trash size={20} />
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
        <Button
          isIconOnly
          className="fixed bottom-4 right-4 text-white rounded-full p-3 shadow-md cursor-pointer"
          onPress={handlePlusClick}
        >
          <Plus size={25} />
        </Button>
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="3xl">
          <ModalContent className="dark bg-black">
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Modal Title
                </ModalHeader>
                <ModalBody>
                  <Textarea
                    variant="faded"
                    maxRows={3}
                    placeholder="Enter your Notes"
                    size="sm"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                  />
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Close
                  </Button>
                  <Button
                    color="primary"
                    onPress={() => {
                      addNote();
                      onClose();
                    }}
                  >
                    Save
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </>
  );
}
