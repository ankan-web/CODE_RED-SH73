import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { Card, PageHeader } from '../components/Shared';
import { collection, addDoc, deleteDoc, doc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

function ResourceModal({ initial, onClose, onSave }) {
  const [title, setTitle] = useState(initial?.title || '');
  const [links, setLinks] = useState(initial?.links || [{ title: '', url: '', type: 'Article' }]);

  const updateLink = (idx, field, value) => {
    const next = links.slice();
    next[idx] = { ...next[idx], [field]: value };
    setLinks(next);
  };
  const addLinkRow = () => setLinks(prev => [...prev, { title: '', url: '', type: 'Article' }]);
  const removeLinkRow = (idx) => setLinks(prev => prev.filter((_, i) => i !== idx));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
        <h3 className="text-lg font-bold mb-4">{initial?.id ? 'Edit Resource' : 'Add New Resource'}</h3>
        <form onSubmit={(e) => { e.preventDefault(); onSave({ title, links }); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Topic Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
          </div>
          <hr />
          {links.map((link, index) => (
            <div key={index} className="space-y-2 p-3 border rounded-md relative">
              {links.length > 1 && (
                <button type="button" onClick={() => removeLinkRow(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">&times;</button>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Link Title</label>
                <input value={link.title} onChange={(e) => updateLink(index, 'title', e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">URL</label>
                <input type="url" value={link.url} onChange={(e) => updateLink(index, 'url', e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select value={link.type} onChange={(e) => updateLink(index, 'type', e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                  <option>Article</option>
                  <option>Video</option>
                  <option>Guide</option>
                  <option>PDF</option>
                </select>
              </div>
            </div>
          ))}
          <button type="button" onClick={addLinkRow} className="text-sm bg-gray-100 text-gray-700 font-semibold px-3 py-1.5 rounded-md hover:bg-gray-200 w-full">Add Another Link</button>
          <div className="flex justify-end space-x-2 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const colRef = collection(db, 'resources');
    const unsub = onSnapshot(colRef, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setResources(list);
    });
    return () => unsub();
  }, []);

  const handleAdd = async (data) => {
    await addDoc(collection(db, 'resources'), { ...data, createdAt: serverTimestamp() });
    setModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resource?')) return;
    await deleteDoc(doc(db, 'resources', id));
  };

  return (
    <div>
      {modalOpen && (
        <ResourceModal onClose={() => setModalOpen(false)} onSave={handleAdd} />
      )}
      <PageHeader title="Resource Hub" />
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50"><tr><th className="px-6 py-3">Topic</th><th className="px-6 py-3 text-right">Actions</th></tr></thead>
            <tbody>
              {resources.map(resource => (
                <Fragment key={resource.id}>
                  <tr onClick={() => setExpandedRow(expandedRow === resource.id ? null : resource.id)} className="bg-white border-b hover:bg-gray-50 cursor-pointer">
                    <td className="px-6 py-4 font-medium text-gray-900">{resource.title}</td>
                    <td className="px-6 py-4 text-right space-x-4">
                      {/* Edit could open modal with data; omitted for brevity */}
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(resource.id); }} className="font-medium text-red-600 hover:underline">Delete</button>
                    </td>
                  </tr>
                  {expandedRow === resource.id && (
                    <tr className="bg-gray-50 border-b"><td colSpan="2" className="p-4"><div className="p-4 space-y-3">
                      <h4 className="font-semibold text-gray-700">Associated Media</h4>
                      <ul className="space-y-2">{(resource.links || []).map((link, index) => (
                        <li key={index} className="text-sm">
                          <span className="text-gray-500 mr-2">[{link.type}]</span>
                          <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">{link.title}</a>
                        </li>
                      ))}</ul>
                    </div></td></tr>
                  )}
                </Fragment>
              ))}
              {resources.length === 0 && (
                <tr><td className="px-6 py-6 text-gray-500" colSpan={2}>No resources yet. Click "Add New Resource" below.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="mt-6">
        <button onClick={() => setModalOpen(true)} className="w-full flex items-center justify-center bg-teal-500 text-white font-semibold px-4 py-3 rounded-lg hover:bg-teal-600 space-x-2 transition-colors">Add New Resource</button>
      </div>
    </div>
  );
}


