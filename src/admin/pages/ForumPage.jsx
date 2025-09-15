import React, { Fragment, useState } from 'react';
import { Card, PageHeader } from '../components/Shared';

const mockForumTopics = [
  { id: 1, title: 'How do you manage stress before presentations?', author: 'Aarav Sharma', replies: 12, lastReply: '2025-09-10', status: 'Open' },
  { id: 2, title: 'Best tips to find a study-life balance?', author: 'Saanvi Patel', replies: 8, lastReply: '2025-09-09', status: 'Open' },
];

export default function ForumPage() {
  const [topics, setTopics] = useState(mockForumTopics);
  const [expandedRow, setExpandedRow] = useState(null);
  return (
    <div>
      <PageHeader title="Forum Management" />
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Topic</th>
                <th className="px-6 py-3">Author</th>
                <th className="px-6 py-3">Replies</th>
                <th className="px-6 py-3">Last Reply</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {topics.map(topic => (
                <Fragment key={topic.id}>
                  <tr onClick={() => setExpandedRow(expandedRow === topic.id ? null : topic.id)} className="bg-white border-b hover:bg-gray-50 cursor-pointer">
                    <td className="px-6 py-4 font-medium text-gray-900">{topic.title}</td>
                    <td className="px-6 py-4 text-gray-600">{topic.author}</td>
                    <td className="px-6 py-4">{topic.replies}</td>
                    <td className="px-6 py-4">{topic.lastReply}</td>
                    <td className="px-6 py-4"><span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${topic.status === 'Open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{topic.status}</span></td>
                    <td className="px-6 py-4 text-right space-x-4">
                      <button className="font-medium text-blue-600 hover:underline">Edit</button>
                      <button className="font-medium text-red-600 hover:underline" onClick={(e) => { e.stopPropagation(); setTopics(prev => prev.filter(t => t.id !== topic.id)); }}>Delete</button>
                    </td>
                  </tr>
                  {expandedRow === topic.id && (
                    <tr className="bg-gray-50 border-b"><td colSpan="6" className="p-4"><div className="p-4 space-y-3">
                      <h4 className="font-semibold text-gray-700">Discussion Preview</h4>
                      <p className="text-sm text-gray-600">This is a preview of the discussion for <span className="font-semibold">{topic.title}</span>.</p>
                    </div></td></tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}


