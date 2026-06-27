import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '@/config';
import { Search, Filter, CheckCircle2, UserCheck, Eye, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export const CounselorLeadsManager = () => {
    const [leads, setLeads] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUniversity, setSelectedUniversity] = useState('All');

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/admin/counselor-lead`, { credentials: 'include' });
            if (res.ok) {
                setLeads(await res.json());
            } else {
                toast.error("Failed to load counselor leads");
            }
        } catch (error) {
            console.error("Failed to fetch leads", error);
            toast.error("Network error loading leads");
        } finally {
            setIsLoading(false);
        }
    };

    const updateStatus = async (id: string, status: 'Contacted' | 'Closed') => {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/counselor-lead/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
                credentials: 'include'
            });

            if (res.ok) {
                toast.success(`Lead marked as ${status}`);
                setLeads(prev => prev.map(lead => lead._id === id ? { ...lead, status } : lead));
            } else {
                const data = await res.json();
                toast.error(data.message || "Failed to update status");
            }
        } catch (error) {
            console.error("Status update failed", error);
            toast.error("Network error updating status");
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Contacted':
                return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'Closed':
                return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            default:
                return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
        }
    };

    // Get list of unique university names for filter
    const universitiesFilterList = ['All', ...Array.from(new Set(leads.map(lead => lead.university?.name || lead.universityName || 'Unknown').filter(Boolean)))];

    // Filter leads
    const filteredLeads = leads.filter(lead => {
        const uniName = lead.university?.name || lead.universityName || 'Unknown';
        const matchesUni = selectedUniversity === 'All' || uniName === selectedUniversity;

        const matchesSearch = 
            lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
            uniName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (lead.message && lead.message.toLowerCase().includes(searchTerm.toLowerCase()));

        return matchesUni && matchesSearch;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                {/* Search Bar */}
                <div className="relative max-w-sm w-full">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input 
                        type="text" 
                        placeholder="Search leads name, email, phone..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-black border border-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                {/* University Filter dropdown */}
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <select
                        value={selectedUniversity}
                        onChange={(e) => setSelectedUniversity(e.target.value)}
                        className="py-2 pl-3 pr-8 bg-white dark:bg-black border border-border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                    >
                        {universitiesFilterList.map(uni => (
                          <option key={uni} value={uni}>{uni}</option>
                        ))}
                    </select>

                    <button 
                        onClick={fetchLeads} 
                        className="p-2 border border-border bg-white dark:bg-black hover:bg-secondary rounded-lg transition-colors"
                        title="Reload Leads"
                    >
                        <RefreshCw className="w-4 h-4 text-muted-foreground" />
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-black border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 font-semibold tracking-wider">Student Contact Details</th>
                                <th className="px-6 py-4 font-semibold tracking-wider">Interested University</th>
                                <th className="px-6 py-4 font-semibold tracking-wider max-w-xs">Message</th>
                                <th className="px-6 py-4 font-semibold tracking-wider">Requested On</th>
                                <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                                <th className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">Loading leads...</td>
                                </tr>
                            ) : filteredLeads.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">No counselor leads found.</td>
                                </tr>
                            ) : filteredLeads.map((lead) => {
                                const uniName = lead.university?.name || lead.universityName || 'Unknown';
                                return (
                                    <motion.tr 
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        key={lead._id} className="hover:bg-secondary/20 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-foreground">{lead.name}</div>
                                            <div className="text-xs text-muted-foreground">{lead.email}</div>
                                            <div className="text-xs text-muted-foreground mt-0.5">{lead.phone}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-foreground">{uniName}</div>
                                            {lead.university?.location && (
                                                <div className="text-xs text-muted-foreground">{lead.university.location}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 max-w-xs text-muted-foreground truncate" title={lead.message}>
                                            {lead.message || <span className="italic text-muted-foreground/50">No message</span>}
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {lead.createdAt ? format(new Date(lead.createdAt), 'MMM dd, yyyy') : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn("px-2.5 py-1 text-xs font-semibold rounded-full border", getStatusStyle(lead.status))}>
                                                {lead.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {lead.status !== 'Contacted' && lead.status !== 'Closed' && (
                                                    <button 
                                                        onClick={() => updateStatus(lead._id, 'Contacted')} 
                                                        className="p-1.5 rounded-md hover:bg-blue-500/10 text-blue-500 transition-colors flex items-center gap-1 border border-transparent hover:border-blue-500/20 text-xs font-semibold" 
                                                        aria-label="Mark Contacted"
                                                    >
                                                        <UserCheck className="w-4 h-4" />
                                                        <span>Contacted</span>
                                                    </button>
                                                )}
                                                {lead.status !== 'Closed' && (
                                                    <button 
                                                        onClick={() => updateStatus(lead._id, 'Closed')} 
                                                        className="p-1.5 rounded-md hover:bg-green-500/10 text-green-500 transition-colors flex items-center gap-1 border border-transparent hover:border-green-500/20 text-xs font-semibold" 
                                                        aria-label="Mark Closed"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" />
                                                        <span>Close</span>
                                                    </button>
                                                )}
                                                {lead.status === 'Closed' && (
                                                    <span className="text-xs text-muted-foreground italic">Closed</span>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CounselorLeadsManager;
