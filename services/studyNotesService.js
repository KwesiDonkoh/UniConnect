/**
 * studyNotesService.js
 * --------------------
 * Firestore-backed service for Smart Notes and Mind Maps.
 * All data is scoped to the current user (ownerUid).
 *
 * Collections:
 *   studyNotes/{noteId}   — Smart Notes
 *   mindMaps/{mapId}      — Mind Maps
 */

import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  limit,
} from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';

class StudyNotesService {
  constructor() {
    this.notesListeners = new Map();
    this.mapsListeners = new Map();
    this.currentUserId = null;

    auth.onAuthStateChanged((user) => {
      this.currentUserId = user ? user.uid : null;
      if (!user) this.cleanup();
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SMART NOTES — CRUD
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Create a new Smart Note.
   * @param {object} noteData - { title, content, tags, category, courseCode? }
   * @returns {{ success, noteId? }}
   */
  async createNote(noteData) {
    if (!this.currentUserId) return { success: false, error: 'Not authenticated' };

    try {
      const note = {
        ownerUid: this.currentUserId,
        title: noteData.title || 'Untitled Note',
        content: noteData.content || '',
        tags: noteData.tags || [],
        category: noteData.category || 'General',
        courseCode: noteData.courseCode || null,
        isPinned: noteData.isPinned || false,
        isAIEnhanced: noteData.isAIEnhanced || false,
        aiSummary: noteData.aiSummary || null,
        color: noteData.color || '#1e40af',       // accent colour for UI
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'studyNotes'), note);
      return { success: true, noteId: docRef.id, note: { id: docRef.id, ...note } };
    } catch (error) {
      console.error('Error creating note:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update an existing Smart Note.
   * @param {string} noteId
   * @param {object} updates - Partial fields to update
   */
  async updateNote(noteId, updates) {
    if (!this.currentUserId) return { success: false, error: 'Not authenticated' };

    try {
      const noteRef = doc(db, 'studyNotes', noteId);
      const noteDoc = await getDoc(noteRef);

      if (!noteDoc.exists()) return { success: false, error: 'Note not found' };
      if (noteDoc.data().ownerUid !== this.currentUserId)
        return { success: false, error: 'Permission denied' };

      await updateDoc(noteRef, { ...updates, updatedAt: serverTimestamp() });
      return { success: true };
    } catch (error) {
      console.error('Error updating note:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a Smart Note.
   * @param {string} noteId
   */
  async deleteNote(noteId) {
    if (!this.currentUserId) return { success: false, error: 'Not authenticated' };

    try {
      const noteRef = doc(db, 'studyNotes', noteId);
      const noteDoc = await getDoc(noteRef);

      if (!noteDoc.exists()) return { success: false, error: 'Note not found' };
      if (noteDoc.data().ownerUid !== this.currentUserId)
        return { success: false, error: 'Permission denied' };

      await deleteDoc(noteRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting note:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all notes for the current user, optionally filtered.
   * @param {{ category?, courseCode?, tag?, pinned? }} filters
   */
  async getMyNotes(filters = {}) {
    if (!this.currentUserId) return [];

    try {
      let q = query(
        collection(db, 'studyNotes'),
        where('ownerUid', '==', this.currentUserId),
        orderBy('updatedAt', 'desc')
      );

      const snapshot = await getDocs(q);
      let notes = [];

      snapshot.forEach((d) => {
        const data = d.data();
        notes.push({
          id: d.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        });
      });

      // Client-side filtering for tags and category (avoids complex Firestore index)
      if (filters.category) notes = notes.filter((n) => n.category === filters.category);
      if (filters.courseCode) notes = notes.filter((n) => n.courseCode === filters.courseCode);
      if (filters.tag) notes = notes.filter((n) => n.tags?.includes(filters.tag));
      if (filters.pinned) notes = notes.filter((n) => n.isPinned);

      return notes;
    } catch (error) {
      console.error('Error getting notes:', error);
      return [];
    }
  }

  /**
   * Search notes by keyword (title or content).
   * @param {string} keyword
   */
  async searchNotes(keyword) {
    const notes = await this.getMyNotes();
    const kw = keyword.toLowerCase();
    return notes.filter(
      (n) =>
        n.title?.toLowerCase().includes(kw) ||
        n.content?.toLowerCase().includes(kw) ||
        n.tags?.some((t) => t.toLowerCase().includes(kw))
    );
  }

  /**
   * Toggle pin state on a note.
   */
  async togglePin(noteId) {
    if (!this.currentUserId) return { success: false };

    try {
      const noteRef = doc(db, 'studyNotes', noteId);
      const noteDoc = await getDoc(noteRef);
      if (!noteDoc.exists()) return { success: false };

      await updateDoc(noteRef, {
        isPinned: !noteDoc.data().isPinned,
        updatedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error) {
      console.error('Error toggling pin:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Real-time listener: stream notes to the caller.
   * @param {function} callback
   * @param {{ category?, courseCode? }} filters
   * @returns {function} unsubscribe
   */
  listenToNotes(callback, filters = {}) {
    if (!this.currentUserId) { callback([]); return () => {}; }

    const q = query(
      collection(db, 'studyNotes'),
      where('ownerUid', '==', this.currentUserId),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let notes = [];
        snapshot.forEach((d) => {
          const data = d.data();
          notes.push({
            id: d.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
          });
        });

        if (filters.category) notes = notes.filter((n) => n.category === filters.category);
        if (filters.courseCode) notes = notes.filter((n) => n.courseCode === filters.courseCode);
        if (filters.tag) notes = notes.filter((n) => n.tags?.includes(filters.tag));

        callback(notes);
      },
      (error) => {
        console.error('Error listening to notes:', error);
        callback([]);
      }
    );

    this.notesListeners.set('notes', unsubscribe);
    return unsubscribe;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MIND MAPS — CRUD
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Create a new Mind Map.
   * @param {object} mapData - { title, nodes, edges, courseCode?, color? }
   *   nodes: [{ id, label, x, y, color? }]
   *   edges: [{ id, source, target, label? }]
   */
  async createMindMap(mapData) {
    if (!this.currentUserId) return { success: false, error: 'Not authenticated' };

    try {
      const map = {
        ownerUid: this.currentUserId,
        title: mapData.title || 'Untitled Map',
        nodes: mapData.nodes || [],
        edges: mapData.edges || [],
        courseCode: mapData.courseCode || null,
        color: mapData.color || '#7c3aed',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'mindMaps'), map);
      return { success: true, mapId: docRef.id, map: { id: docRef.id, ...map } };
    } catch (error) {
      console.error('Error creating mind map:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update an existing Mind Map's nodes/edges/title.
   */
  async updateMindMap(mapId, updates) {
    if (!this.currentUserId) return { success: false, error: 'Not authenticated' };

    try {
      const mapRef = doc(db, 'mindMaps', mapId);
      const mapDoc = await getDoc(mapRef);

      if (!mapDoc.exists()) return { success: false, error: 'Mind map not found' };
      if (mapDoc.data().ownerUid !== this.currentUserId)
        return { success: false, error: 'Permission denied' };

      await updateDoc(mapRef, { ...updates, updatedAt: serverTimestamp() });
      return { success: true };
    } catch (error) {
      console.error('Error updating mind map:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a Mind Map.
   */
  async deleteMindMap(mapId) {
    if (!this.currentUserId) return { success: false, error: 'Not authenticated' };

    try {
      const mapRef = doc(db, 'mindMaps', mapId);
      const mapDoc = await getDoc(mapRef);

      if (!mapDoc.exists()) return { success: false, error: 'Mind map not found' };
      if (mapDoc.data().ownerUid !== this.currentUserId)
        return { success: false, error: 'Permission denied' };

      await deleteDoc(mapRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting mind map:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all mind maps for the current user.
   */
  async getMyMindMaps() {
    if (!this.currentUserId) return [];

    try {
      const q = query(
        collection(db, 'mindMaps'),
        where('ownerUid', '==', this.currentUserId),
        orderBy('updatedAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const maps = [];
      snapshot.forEach((d) => {
        const data = d.data();
        maps.push({
          id: d.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        });
      });
      return maps;
    } catch (error) {
      console.error('Error getting mind maps:', error);
      return [];
    }
  }

  /**
   * Real-time listener: stream mind maps to the caller.
   */
  listenToMindMaps(callback) {
    if (!this.currentUserId) { callback([]); return () => {}; }

    const q = query(
      collection(db, 'mindMaps'),
      where('ownerUid', '==', this.currentUserId),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const maps = [];
        snapshot.forEach((d) => {
          const data = d.data();
          maps.push({
            id: d.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
          });
        });
        callback(maps);
      },
      (error) => {
        console.error('Error listening to mind maps:', error);
        callback([]);
      }
    );

    this.mapsListeners.set('maps', unsubscribe);
    return unsubscribe;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STATS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Quick stats for the dashboard (note count, map count, etc.)
   */
  async getStats() {
    const [notes, maps] = await Promise.all([this.getMyNotes(), this.getMyMindMaps()]);
    const allTags = notes.flatMap((n) => n.tags || []);
    const uniqueTags = [...new Set(allTags)];

    return {
      totalNotes: notes.length,
      pinnedNotes: notes.filter((n) => n.isPinned).length,
      aiEnhancedNotes: notes.filter((n) => n.isAIEnhanced).length,
      totalMindMaps: maps.length,
      uniqueTags,
      categories: [...new Set(notes.map((n) => n.category))].filter(Boolean),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CLEANUP
  // ─────────────────────────────────────────────────────────────────────────

  cleanup() {
    this.currentUserId = null;
    this.notesListeners.forEach((unsub) => { if (typeof unsub === 'function') unsub(); });
    this.mapsListeners.forEach((unsub) => { if (typeof unsub === 'function') unsub(); });
    this.notesListeners.clear();
    this.mapsListeners.clear();
  }
}

export default new StudyNotesService();
