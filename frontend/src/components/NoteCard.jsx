import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Spinner,
  Input,
  Chip,
} from "@nextui-org/react";
import { Textarea } from "@nextui-org/react";
import { Plus, Trash2, Edit3, Clock, FileText, ArrowRight } from "react-feather";
import api from "../api";
import { useAuth } from "../authentication/AuthContext";
import { useNavigate } from "react-router-dom";

export default function NoteCard() {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [editingNote, setEditingNote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isLoggedIn && user) {
      fetchNotes();
    } else {
      setNotes([]);
    }
  }, [isLoggedIn, user]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const response = await api.get("/notes");
      setNotes(response.data);
    } catch (err) {
      console.error("Error fetching notes:", err);
      setError("Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  const handlePlusClick = () => {
    if (isLoggedIn) {
      setEditingNote(null);
      setNoteTitle("");
      setNoteContent("");
      setError("");
      onOpen();
    } else {
      navigate("/login");
    }
  };

  const handleEditClick = (note) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content || "");
    setError("");
    onOpen();
  };

  const handleSave = async () => {
    if (!noteTitle.trim()) {
      setError("Title is required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (editingNote) {
        await api.put(`/notes/${editingNote.id}`, {
          title: noteTitle,
          content: noteContent,
        });
      } else {
        await api.post("/notes", {
          title: noteTitle,
          content: noteContent,
        });
      }
      setNoteTitle("");
      setNoteContent("");
      setEditingNote(null);
      onClose();
      fetchNotes();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to save note";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const deleteNote = async (noteId) => {
    try {
      await api.delete(`/notes/${noteId}`);
      setNotes(notes.filter((n) => n.id !== noteId));
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const noteColors = [
    "from-violet-500/10 to-violet-600/5 border-violet-500/10",
    "from-blue-500/10 to-blue-600/5 border-blue-500/10",
    "from-emerald-500/10 to-emerald-600/5 border-emerald-500/10",
    "from-amber-500/10 to-amber-600/5 border-amber-500/10",
    "from-pink-500/10 to-pink-600/5 border-pink-500/10",
    "from-cyan-500/10 to-cyan-600/5 border-cyan-500/10",
  ];

  const accentDots = [
    "bg-violet-400",
    "bg-blue-400",
    "bg-emerald-400",
    "bg-amber-400",
    "bg-pink-400",
    "bg-cyan-400",
  ];

  // --- Landing page for logged-out users ---
  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        {/* Hero */}
        <div className="text-center max-w-2xl animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-white/50 tracking-wide uppercase">
              Simple & Secure
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6">
            <span className="text-white">Your thoughts,</span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              beautifully organized.
            </span>
          </h1>

          <p className="text-lg text-white/40 mb-10 max-w-lg mx-auto leading-relaxed">
            A minimal notes app that stays out of your way.
            Write, organize, and access your notes from anywhere.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Button
              size="lg"
              radius="full"
              className="bg-gradient-to-r from-violet-600 to-blue-600 text-white font-medium px-8 shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 transition-shadow"
              href="/signup"
              as="a"
              endContent={<ArrowRight size={16} />}
            >
              Get Started
            </Button>
            <Button
              size="lg"
              radius="full"
              variant="bordered"
              className="border-white/10 text-white/70 hover:bg-white/5 px-8"
              href="/login"
              as="a"
            >
              Login
            </Button>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-20 max-w-3xl w-full stagger-children">
          {[
            {
              icon: <FileText size={20} />,
              title: "Quick Capture",
              desc: "Jot down ideas in seconds",
            },
            {
              icon: <Edit3 size={20} />,
              title: "Rich Editing",
              desc: "Create and edit with ease",
            },
            {
              icon: <Clock size={20} />,
              title: "Always Synced",
              desc: "Access notes anywhere",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="glass rounded-2xl p-6 text-center group hover:bg-white/5 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3 text-white/40 group-hover:text-violet-400 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-sm font-medium text-white/80 mb-1">
                {feature.title}
              </h3>
              <p className="text-xs text-white/30">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- Loading state ---
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Spinner size="lg" color="primary" />
        <p className="text-sm text-white/30">Loading your notes...</p>
      </div>
    );
  }

  // --- Notes dashboard ---
  return (
    <div className="py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {user?.username || "there"}
          </h1>
          <p className="text-sm text-white/40 mt-1">
            {notes.length === 0
              ? "Create your first note to get started"
              : `You have ${notes.length} note${notes.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Button
          color="primary"
          radius="full"
          size="md"
          className="bg-gradient-to-r from-violet-600 to-blue-600 text-white font-medium shadow-lg shadow-violet-500/20 px-5"
          startContent={<Plus size={16} />}
          onPress={handlePlusClick}
        >
          New Note
        </Button>
      </div>

      {/* Notes grid */}
      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] animate-fade-in-up">
          <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-5">
            <FileText size={32} className="text-white/20" />
          </div>
          <h3 className="text-lg font-medium text-white/60 mb-2">No notes yet</h3>
          <p className="text-sm text-white/30 mb-6">
            Click "New Note" to create your first one
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {notes.map((note, index) => (
            <Card
              key={note.id}
              isPressable
              onPress={() => handleEditClick(note)}
              className={`note-card bg-gradient-to-br ${noteColors[index % noteColors.length]} border border-white/5 shadow-none cursor-pointer`}
              radius="lg"
            >
              <CardBody className="p-5 gap-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${accentDots[index % accentDots.length]}`}
                    />
                    <h3 className="text-base font-semibold text-white/90 line-clamp-1">
                      {note.title}
                    </h3>
                  </div>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    radius="full"
                    className="text-white/20 hover:text-red-400 hover:bg-red-500/10 min-w-6 w-6 h-6"
                    onPress={(e) => {
                      e?.stopPropagation?.();
                      deleteNote(note.id);
                    }}
                  >
                    <Trash2 size={13} />
                  </Button>
                </div>

                <p className="text-sm text-white/40 line-clamp-4 leading-relaxed whitespace-pre-wrap">
                  {note.content || "No content"}
                </p>

                <div className="flex items-center justify-between mt-auto pt-2">
                  <span className="text-[11px] text-white/20 flex items-center gap-1">
                    <Clock size={10} />
                    {formatDate(note.updated_at || note.created_at)}
                  </span>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Floating action button (mobile) */}
      <Button
        isIconOnly
        size="lg"
        radius="full"
        className="fixed bottom-8 right-8 bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-2xl shadow-violet-500/30 sm:hidden z-50 w-14 h-14"
        onPress={handlePlusClick}
      >
        <Plus size={22} />
      </Button>

      {/* Modal */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="2xl"
        backdrop="blur"
        classNames={{
          backdrop: "bg-black/60 backdrop-blur-sm",
          base: "border border-white/10 bg-zinc-900/95 shadow-2xl",
        }}
      >
        <ModalContent>
          {(onCloseModal) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-white/90 pb-0">
                {editingNote ? "Edit Note" : "New Note"}
              </ModalHeader>
              <ModalBody className="py-4">
                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}
                <Input
                  label="Title"
                  placeholder="Give your note a title..."
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  variant="bordered"
                  size="lg"
                  classNames={{
                    inputWrapper: "border-white/10 hover:border-white/20 bg-white/5",
                    input: "text-white/90",
                    label: "text-white/40",
                  }}
                />
                <Textarea
                  label="Content"
                  placeholder="Write your thoughts..."
                  variant="bordered"
                  minRows={6}
                  maxRows={14}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  classNames={{
                    inputWrapper: "border-white/10 hover:border-white/20 bg-white/5",
                    input: "text-white/90",
                    label: "text-white/40",
                  }}
                />
              </ModalBody>
              <ModalFooter className="pt-0">
                <Button
                  variant="light"
                  onPress={onCloseModal}
                  className="text-white/40 hover:text-white/70"
                >
                  Cancel
                </Button>
                <Button
                  isLoading={saving}
                  onPress={handleSave}
                  radius="full"
                  className="bg-gradient-to-r from-violet-600 to-blue-600 text-white font-medium px-6"
                >
                  {editingNote ? "Update" : "Create"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
