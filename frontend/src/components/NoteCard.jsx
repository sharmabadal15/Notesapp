import React, { useState, useEffect, useCallback, useRef } from "react";
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
  Tooltip,
} from "@nextui-org/react";
import { Textarea } from "@nextui-org/react";
import {
  Plus,
  Trash2,
  Clock,
  FileText,
  ArrowRight,
  Edit3,
  Search,
  Bookmark,
} from "react-feather";
import api from "../api";
import { useAuth } from "../authentication/AuthContext";
import { useNavigate } from "react-router-dom";

const NOTE_COLORS = [
  { key: "default", label: "Default", gradient: "from-violet-500/10 to-violet-600/5", border: "border-violet-500/10", dot: "bg-violet-400" },
  { key: "blue", label: "Blue", gradient: "from-blue-500/10 to-blue-600/5", border: "border-blue-500/10", dot: "bg-blue-400" },
  { key: "emerald", label: "Green", gradient: "from-emerald-500/10 to-emerald-600/5", border: "border-emerald-500/10", dot: "bg-emerald-400" },
  { key: "amber", label: "Amber", gradient: "from-amber-500/10 to-amber-600/5", border: "border-amber-500/10", dot: "bg-amber-400" },
  { key: "pink", label: "Pink", gradient: "from-pink-500/10 to-pink-600/5", border: "border-pink-500/10", dot: "bg-pink-400" },
  { key: "cyan", label: "Cyan", gradient: "from-cyan-500/10 to-cyan-600/5", border: "border-cyan-500/10", dot: "bg-cyan-400" },
];

function getColorConfig(colorKey) {
  return NOTE_COLORS.find((c) => c.key === colorKey) || NOTE_COLORS[0];
}

const MAX_CONTENT_LENGTH = 5000;

export default function NoteCard() {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const deleteModal = useDisclosure();
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  const [notes, setNotes] = useState([]);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteColor, setNoteColor] = useState("default");
  const [editingNote, setEditingNote] = useState(null);
  const [deletingNote, setDeletingNote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setSearchDebounced(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (isLoggedIn && user) {
      fetchNotes(searchDebounced);
    } else {
      setNotes([]);
    }
  }, [isLoggedIn, user, searchDebounced]);

  // Keyboard shortcut: Cmd/Ctrl+K to create new note
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isLoggedIn) {
          handleNewNote();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLoggedIn]);

  const fetchNotes = async (search = "") => {
    setLoading(true);
    try {
      const params = search ? { search } : {};
      const response = await api.get("/notes", { params });
      setNotes(response.data);
    } catch (err) {
      console.error("Error fetching notes:", err);
      setError("Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  const handleNewNote = () => {
    setEditingNote(null);
    setNoteTitle("");
    setNoteContent("");
    setNoteColor("default");
    setError("");
    onOpen();
  };

  const handlePlusClick = () => {
    if (isLoggedIn) {
      handleNewNote();
    } else {
      navigate("/login");
    }
  };

  const handleEditClick = (note) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content || "");
    setNoteColor(note.color || "default");
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
          color: noteColor,
        });
      } else {
        await api.post("/notes", {
          title: noteTitle,
          content: noteContent,
          color: noteColor,
        });
      }
      setNoteTitle("");
      setNoteContent("");
      setNoteColor("default");
      setEditingNote(null);
      onClose();
      fetchNotes(searchDebounced);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to save note";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (note, e) => {
    if (e) {
      e.stopPropagation();
    }
    setDeletingNote(note);
    deleteModal.onOpen();
  };

  const handleDelete = async () => {
    if (!deletingNote) return;
    try {
      await api.delete(`/notes/${deletingNote.id}`);
      setNotes(notes.filter((n) => n.id !== deletingNote.id));
      setDeletingNote(null);
      deleteModal.onClose();
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  };

  const togglePin = async (note, e) => {
    if (e) {
      e.stopPropagation();
    }
    try {
      const res = await api.patch(`/notes/${note.id}/pin`);
      setNotes(
        notes
          .map((n) => (n.id === note.id ? { ...n, pinned: res.data.pinned } : n))
          .sort((a, b) => {
            if (a.pinned !== b.pinned) return b.pinned ? 1 : -1;
            return new Date(b.updated_at) - new Date(a.updated_at);
          })
      );
    } catch (err) {
      console.error("Error toggling pin:", err);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // --- Landing page for logged-out users ---
  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-20 max-w-3xl w-full stagger-children">
          {[
            { icon: <FileText size={20} />, title: "Quick Capture", desc: "Jot down ideas in seconds" },
            { icon: <Edit3 size={20} />, title: "Rich Editing", desc: "Create and edit with ease" },
            { icon: <Clock size={20} />, title: "Always Synced", desc: "Access notes anywhere" },
          ].map((feature, i) => (
            <div key={i} className="glass rounded-2xl p-6 text-center group hover:bg-white/5 transition-all">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3 text-white/40 group-hover:text-violet-400 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-sm font-medium text-white/80 mb-1">{feature.title}</h3>
              <p className="text-xs text-white/30">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- Loading state ---
  if (loading && notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Spinner size="lg" color="primary" />
        <p className="text-sm text-white/30">Loading your notes...</p>
      </div>
    );
  }

  const pinnedNotes = notes.filter((n) => n.pinned);
  const unpinnedNotes = notes.filter((n) => !n.pinned);

  // --- Notes dashboard ---
  return (
    <div className="py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 animate-fade-in-up">
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
          className="bg-gradient-to-r from-violet-600 to-blue-600 text-white font-medium shadow-lg shadow-violet-500/20 px-5 shrink-0"
          startContent={<Plus size={16} />}
          onPress={handlePlusClick}
        >
          New Note
        </Button>
      </div>

      {/* Search bar */}
      <div className="mb-6 animate-fade-in-up">
        <Input
          ref={searchInputRef}
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          variant="bordered"
          size="sm"
          radius="full"
          isClearable
          onClear={() => setSearchQuery("")}
          startContent={<Search size={14} className="text-white/30" />}
          endContent={
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/5 text-[10px] text-white/20 border border-white/5">
              ⌘K
            </kbd>
          }
          classNames={{
            inputWrapper: "border-white/8 hover:border-white/15 bg-white/[0.02] h-10 max-w-md",
            input: "text-white/80 text-sm",
          }}
        />
      </div>

      {/* Notes grid */}
      {notes.length === 0 && !searchQuery ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] animate-fade-in-up">
          <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-5">
            <FileText size={32} className="text-white/20" />
          </div>
          <h3 className="text-lg font-medium text-white/60 mb-2">No notes yet</h3>
          <p className="text-sm text-white/30 mb-1">
            Click "New Note" to create your first one
          </p>
          <p className="text-xs text-white/15">
            or press <kbd className="px-1.5 py-0.5 rounded bg-white/5 text-white/30 border border-white/5 mx-1">Cmd+K</kbd> to quick-create
          </p>
        </div>
      ) : notes.length === 0 && searchQuery ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh] animate-fade-in-up">
          <Search size={32} className="text-white/15 mb-4" />
          <h3 className="text-lg font-medium text-white/50 mb-1">No results</h3>
          <p className="text-sm text-white/25">
            No notes match "{searchQuery}"
          </p>
        </div>
      ) : (
        <>
          {/* Pinned notes */}
          {pinnedNotes.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xs uppercase tracking-widest text-white/25 mb-3 flex items-center gap-1.5">
                <Bookmark size={11} /> Pinned
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
                {pinnedNotes.map((note) => renderNoteCard(note))}
              </div>
            </div>
          )}

          {/* Other notes */}
          {unpinnedNotes.length > 0 && (
            <div>
              {pinnedNotes.length > 0 && (
                <h2 className="text-xs uppercase tracking-widest text-white/25 mb-3">
                  Others
                </h2>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
                {unpinnedNotes.map((note) => renderNoteCard(note))}
              </div>
            </div>
          )}
        </>
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

      {/* Create/Edit Modal */}
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
              <ModalBody className="py-4 gap-4">
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
                <div>
                  <Textarea
                    label="Content"
                    placeholder="Write your thoughts..."
                    variant="bordered"
                    minRows={6}
                    maxRows={14}
                    value={noteContent}
                    onChange={(e) => {
                      if (e.target.value.length <= MAX_CONTENT_LENGTH) {
                        setNoteContent(e.target.value);
                      }
                    }}
                    classNames={{
                      inputWrapper: "border-white/10 hover:border-white/20 bg-white/5",
                      input: "text-white/90",
                      label: "text-white/40",
                    }}
                  />
                  <div className="flex justify-end mt-1">
                    <span className={`text-[11px] ${noteContent.length > MAX_CONTENT_LENGTH * 0.9 ? "text-amber-400" : "text-white/15"}`}>
                      {noteContent.length}/{MAX_CONTENT_LENGTH}
                    </span>
                  </div>
                </div>

                {/* Color picker */}
                <div>
                  <p className="text-xs text-white/30 mb-2">Color</p>
                  <div className="flex gap-2">
                    {NOTE_COLORS.map((c) => (
                      <Tooltip key={c.key} content={c.label} size="sm">
                        <button
                          type="button"
                          onClick={() => setNoteColor(c.key)}
                          className={`w-7 h-7 rounded-full ${c.dot} transition-all ${
                            noteColor === c.key
                              ? "ring-2 ring-white/50 ring-offset-2 ring-offset-zinc-900 scale-110"
                              : "opacity-50 hover:opacity-80"
                          }`}
                        />
                      </Tooltip>
                    ))}
                  </div>
                </div>
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onOpenChange={deleteModal.onOpenChange}
        size="sm"
        backdrop="blur"
        classNames={{
          backdrop: "bg-black/60 backdrop-blur-sm",
          base: "border border-white/10 bg-zinc-900/95 shadow-2xl",
        }}
      >
        <ModalContent>
          {(onCloseDeleteModal) => (
            <>
              <ModalHeader className="text-white/90">Delete Note</ModalHeader>
              <ModalBody className="pb-1">
                <p className="text-white/50 text-sm">
                  Are you sure you want to delete{" "}
                  <span className="text-white/80 font-medium">
                    "{deletingNote?.title}"
                  </span>
                  ? This action cannot be undone.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="light"
                  onPress={onCloseDeleteModal}
                  className="text-white/40 hover:text-white/70"
                >
                  Cancel
                </Button>
                <Button
                  color="danger"
                  variant="flat"
                  onPress={handleDelete}
                  radius="full"
                  className="px-5"
                >
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );

  function renderNoteCard(note) {
    const colorConfig = getColorConfig(note.color);

    return (
      <Card
        key={note.id}
        isPressable
        onPress={() => handleEditClick(note)}
        className={`note-card bg-gradient-to-br ${colorConfig.gradient} border ${colorConfig.border} shadow-none cursor-pointer`}
        radius="lg"
      >
        <CardBody className="p-5 gap-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className={`w-2 h-2 rounded-full shrink-0 ${colorConfig.dot}`} />
              <h3 className="text-base font-semibold text-white/90 line-clamp-1">
                {note.title}
              </h3>
              {note.pinned && (
                <Bookmark size={11} className="text-amber-400 shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-0.5 shrink-0 ml-2">
              <Tooltip content={note.pinned ? "Unpin" : "Pin"} size="sm">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  radius="full"
                  className={`min-w-6 w-6 h-6 ${note.pinned ? "text-amber-400" : "text-white/20 hover:text-amber-400"} hover:bg-amber-500/10`}
                  onPress={(e) => togglePin(note, e)}
                >
                  <Bookmark size={12} />
                </Button>
              </Tooltip>
              <Tooltip content="Delete" size="sm">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  radius="full"
                  className="text-white/20 hover:text-red-400 hover:bg-red-500/10 min-w-6 w-6 h-6"
                  onPress={(e) => confirmDelete(note, e)}
                >
                  <Trash2 size={12} />
                </Button>
              </Tooltip>
            </div>
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
    );
  }
}
