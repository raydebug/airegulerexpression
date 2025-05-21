import { useState } from 'react';
import { useRegexStore, RegexPattern } from '@/stores/regexStore';
import { formatDate, isValidRegex } from '@/utils/helpers';

const RegexLibrary = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<RegexPattern>>({});
  
  const { patterns, updatePattern, deletePattern } = useRegexStore();
  
  // Filter patterns based on search term
  const filteredPatterns = patterns.filter((pattern) => {
    const search = searchTerm.toLowerCase();
    return (
      pattern.name.toLowerCase().includes(search) ||
      pattern.description.toLowerCase().includes(search) ||
      pattern.tags.some((tag) => tag.toLowerCase().includes(search))
    );
  });
  
  // Sort patterns by creation date (newest first)
  const sortedPatterns = [...filteredPatterns].sort((a, b) => b.createdAt - a.createdAt);
  
  const handleStartEdit = (pattern: RegexPattern) => {
    setEditingId(pattern.id);
    setEditForm({
      name: pattern.name,
      description: pattern.description,
      pattern: pattern.pattern,
      tags: pattern.tags.join(', '),
    });
  };
  
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };
  
  const handleSaveEdit = (id: string) => {
    if (!editForm.name?.trim()) {
      return;
    }
    
    if (editForm.pattern && !isValidRegex(editForm.pattern)) {
      return;
    }
    
    const tagList = editForm.tags 
      ? (editForm.tags as string).split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      : [];
    
    updatePattern(id, {
      name: editForm.name,
      description: editForm.description,
      pattern: editForm.pattern,
      tags: tagList,
    });
    
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this pattern?')) {
      deletePattern(id);
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="card">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Your RegEx Library</h1>
          <div>
            <input
              type="text"
              className="input w-64"
              placeholder="Search patterns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {sortedPatterns.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            {searchTerm 
              ? "No patterns match your search" 
              : "Your library is empty. Generate and save some patterns to see them here!"}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedPatterns.map((pattern) => (
              <div key={pattern.id} className="rounded-lg border border-gray-200 dark:border-gray-700">
                {editingId === pattern.id ? (
                  <div className="p-4">
                    <div className="mb-3">
                      <label className="mb-1 block text-sm font-medium">Name</label>
                      <input
                        type="text"
                        className="input"
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label className="mb-1 block text-sm font-medium">Description</label>
                      <textarea
                        className="input"
                        value={editForm.description || ''}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label className="mb-1 block text-sm font-medium">Pattern</label>
                      <input
                        type="text"
                        className="input font-mono"
                        value={editForm.pattern || ''}
                        onChange={(e) => setEditForm({ ...editForm, pattern: e.target.value })}
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="mb-1 block text-sm font-medium">Tags</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="Comma separated tags"
                        value={editForm.tags || ''}
                        onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                      />
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        className="btn btn-primary"
                        onClick={() => handleSaveEdit(pattern.id)}
                      >
                        Save Changes
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-medium">{pattern.name}</h3>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          {pattern.description}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(pattern.createdAt)}
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <code className="block rounded bg-gray-100 p-2 font-mono text-sm dark:bg-gray-800">
                        {pattern.pattern}
                      </code>
                    </div>
                    
                    {pattern.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {pattern.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="mt-4 flex space-x-2">
                      <button
                        className="btn btn-secondary text-sm"
                        onClick={() => handleStartEdit(pattern)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-secondary text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        onClick={() => handleDelete(pattern.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RegexLibrary; 