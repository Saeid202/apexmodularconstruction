"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Plus,
  MoreVertical,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  Star,
  MapPin,
  Briefcase,
  Award,
  Mail,
  Phone,
  Globe,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Shield,
  ShieldOff,
  Check,
  XCircle,
} from "lucide-react";

// Types
interface Contractor {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  website?: string;
  companyDescription?: string;
  serviceTypes: string[];
  serviceAreas: string[];
  yearsExperience: number;
  certifications: Certification[];
  primaryCity: string;
  province: string;
  fullAddress: string;
  status: "pending" | "approved" | "rejected" | "suspended";
  featured: boolean;
  rating: number;
  reviewsCount: number;
  approvedAt?: string;
  createdAt: string;
  adminNotes?: string;
  logo?: string;
}

interface Certification {
  id: string;
  name: string;
  issuedBy: string;
  expiryDate: string;
}

type SortBy = "name" | "status" | "rating" | "created";
type SortOrder = "asc" | "desc";

interface Filters {
  status: "all" | "pending" | "approved" | "rejected" | "suspended";
  serviceType: string;
  province: string;
  experienceLevel: "all" | "beginner" | "intermediate" | "expert";
  featuredOnly: boolean;
  ratingMin: number;
}

const PROVINCES = [
  "ON",
  "QC",
  "BC",
  "AB",
  "MB",
  "SK",
  "NS",
  "NB",
  "PE",
  "NL",
];
const SERVICE_TYPES = [
  "Solar Installation",
  "Solar Maintenance",
  "Battery Installation",
  "EV Charging",
  "Maintenance",
];

// Utility function to get status color
function getStatusColor(
  status: string
): { bg: string; text: string; icon: React.ReactNode } {
  switch (status) {
    case "pending":
      return {
        bg: "bg-yellow-50",
        text: "text-yellow-700",
        icon: <Clock className="h-4 w-4" />,
      };
    case "approved":
      return {
        bg: "bg-green-50",
        text: "text-green-700",
        icon: <CheckCircle className="h-4 w-4" />,
      };
    case "rejected":
      return {
        bg: "bg-red-50",
        text: "text-red-700",
        icon: <XCircle className="h-4 w-4" />,
      };
    case "suspended":
      return {
        bg: "bg-orange-50",
        text: "text-orange-700",
        icon: <AlertCircle className="h-4 w-4" />,
      };
    default:
      return {
        bg: "bg-gray-50",
        text: "text-gray-700",
        icon: null,
      };
  }
}

// Utility to get experience level
function getExperienceLevel(years: number): string {
  if (years >= 10) return "Expert";
  if (years >= 5) return "Intermediate";
  return "Beginner";
}

export default function ContractorManagementClient() {
  // State
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("created");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsSidebar, setShowDetailsSidebar] = useState(false);
  const [selectedContractor, setSelectedContractor] =
    useState<Contractor | null>(null);
  const [selectedForBulk, setSelectedForBulk] = useState<Set<string>>(
    new Set()
  );
  const [filterOpen, setFilterOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Filter state
  const [filters, setFilters] = useState<Filters>({
    status: "all",
    serviceType: "",
    province: "",
    experienceLevel: "all",
    featuredOnly: false,
    ratingMin: 0,
  });

  const ITEMS_PER_PAGE = 10;

  // Load contractors
  const loadContractors = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/contractors");
      if (response.ok) {
        const data = await response.json();
        setContractors(data);
      }
    } catch (error) {
      console.error("Failed to load contractors:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContractors();
  }, [loadContractors]);

  // Filter and search
  const filteredContractors = useMemo(() => {
    return contractors.filter((c) => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        c.companyName.toLowerCase().includes(searchLower) ||
        c.contactEmail.toLowerCase().includes(searchLower) ||
        c.contactName.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;

      // Status filter
      if (filters.status !== "all" && c.status !== filters.status) {
        return false;
      }

      // Service type filter
      if (
        filters.serviceType &&
        !c.serviceTypes.includes(filters.serviceType)
      ) {
        return false;
      }

      // Province filter
      if (filters.province && c.province !== filters.province) {
        return false;
      }

      // Experience level filter
      if (filters.experienceLevel !== "all") {
        const exp = getExperienceLevel(c.yearsExperience);
        if (
          (filters.experienceLevel === "beginner" && exp !== "Beginner") ||
          (filters.experienceLevel === "intermediate" &&
            exp !== "Intermediate") ||
          (filters.experienceLevel === "expert" && exp !== "Expert")
        ) {
          return false;
        }
      }

      // Featured filter
      if (filters.featuredOnly && !c.featured) {
        return false;
      }

      // Rating filter
      if (c.rating < filters.ratingMin) {
        return false;
      }

      return true;
    });
  }, [contractors, searchTerm, filters]);

  // Sort
  const sortedContractors = useMemo(() => {
    const sorted = [...filteredContractors].sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];

      // Handle different sort fields
      if (sortBy === "created") {
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
      }

      // Compare
      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredContractors, sortBy, sortOrder]);

  // Pagination
  const paginatedContractors = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedContractors.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedContractors, currentPage]);

  const totalPages = Math.ceil(sortedContractors.length / ITEMS_PER_PAGE);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: contractors.length,
      pending: contractors.filter((c) => c.status === "pending").length,
      featured: contractors.filter((c) => c.featured).length,
      avgRating:
        contractors.length > 0
          ? (
              contractors.reduce((sum, c) => sum + c.rating, 0) /
              contractors.length
            ).toFixed(1)
          : "0",
    };
  }, [contractors]);

  // Handlers
  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      const response = await fetch(`/api/admin/contractors/${id}/approve`, {
        method: "POST",
      });
      if (response.ok) {
        loadContractors();
        if (selectedContractor?.id === id) {
          setShowDetailsSidebar(false);
        }
      }
    } catch (error) {
      console.error("Failed to approve contractor:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    try {
      const response = await fetch(`/api/admin/contractors/${id}/reject`, {
        method: "POST",
      });
      if (response.ok) {
        loadContractors();
        if (selectedContractor?.id === id) {
          setShowDetailsSidebar(false);
        }
      }
    } catch (error) {
      console.error("Failed to reject contractor:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleFeatured = async (id: string) => {
    setActionLoading(id);
    try {
      const response = await fetch(`/api/admin/contractors/${id}/feature`, {
        method: "POST",
      });
      if (response.ok) {
        loadContractors();
        if (selectedContractor?.id === id) {
          const updated = contractors.find((c) => c.id === id);
          if (updated) setSelectedContractor(updated);
        }
      }
    } catch (error) {
      console.error("Failed to toggle featured:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleSuspend = async (id: string) => {
    setActionLoading(id);
    try {
      const response = await fetch(`/api/admin/contractors/${id}/suspend`, {
        method: "POST",
      });
      if (response.ok) {
        loadContractors();
        if (selectedContractor?.id === id) {
          const updated = contractors.find((c) => c.id === id);
          if (updated) setSelectedContractor(updated);
        }
      }
    } catch (error) {
      console.error("Failed to toggle suspend:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contractor?")) return;

    setActionLoading(id);
    try {
      const response = await fetch(`/api/admin/contractors/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        loadContractors();
        if (selectedContractor?.id === id) {
          setShowDetailsSidebar(false);
        }
      }
    } catch (error) {
      console.error("Failed to delete contractor:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkApprove = async () => {
    const ids = Array.from(selectedForBulk);
    for (const id of ids) {
      await handleApprove(id);
    }
    setSelectedForBulk(new Set());
  };

  const handleBulkReject = async () => {
    const ids = Array.from(selectedForBulk);
    for (const id of ids) {
      await handleReject(id);
    }
    setSelectedForBulk(new Set());
  };

  const statusColor = selectedContractor
    ? getStatusColor(selectedContractor.status)
    : null;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Contractor Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage installers and contractors on your platform
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            <Plus className="h-4 w-4" />
            Add Contractor
          </button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
            <p className="text-xs text-gray-600 font-medium">Total</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {stats.total}
            </p>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4">
            <p className="text-xs text-gray-600 font-medium">Pending</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {stats.pending}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
            <p className="text-xs text-gray-600 font-medium">Featured</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {stats.featured}
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
            <p className="text-xs text-gray-600 font-medium">Avg Rating</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {stats.avgRating} ⭐
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Table Area */}
          <div className="flex-1 space-y-4">
            {/* Search and Filter Bar */}
            <div className="flex gap-4 flex-col sm:flex-row">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search by company name, email..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="h-4 w-4" />
                Filters
              </button>
            </div>

            {/* Quick Filter Buttons */}
            <div className="flex gap-2 flex-wrap">
              {[
                { label: "All", value: "all" as const },
                { label: "Pending", value: "pending" as const },
                { label: "Approved", value: "approved" as const },
                { label: "Rejected", value: "rejected" as const },
                { label: "Suspended", value: "suspended" as const },
              ].map((btn) => (
                <button
                  key={btn.value}
                  onClick={() => {
                    setFilters({ ...filters, status: btn.value });
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filters.status === btn.value
                      ? "bg-purple-600 text-white"
                      : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Bulk Actions */}
            {selectedForBulk.size > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">
                  {selectedForBulk.size} contractor
                  {selectedForBulk.size !== 1 ? "s" : ""} selected
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handleBulkApprove}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                  >
                    Approve All
                  </button>
                  <button
                    onClick={handleBulkReject}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                  >
                    Reject All
                  </button>
                  <button
                    onClick={() => setSelectedForBulk(new Set())}
                    className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            {/* Contractors Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {loading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                </div>
              ) : paginatedContractors.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No contractors found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectedForBulk.size === paginatedContractors.length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedForBulk(
                                  new Set(paginatedContractors.map((c) => c.id))
                                );
                              } else {
                                setSelectedForBulk(new Set());
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                          Company
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                          Location
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                          Services
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                          Experience
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                          Rating
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paginatedContractors.map((contractor) => {
                        const isSelected = selectedForBulk.has(contractor.id);
                        return (
                          <tr
                            key={contractor.id}
                            className={`hover:bg-gray-50 transition-colors ${
                              isSelected ? "bg-purple-50" : ""
                            }`}
                          >
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  const newSet = new Set(selectedForBulk);
                                  if (e.target.checked) {
                                    newSet.add(contractor.id);
                                  } else {
                                    newSet.delete(contractor.id);
                                  }
                                  setSelectedForBulk(newSet);
                                }}
                                className="rounded border-gray-300"
                              />
                            </td>
                            <td
                              className="px-4 py-3 cursor-pointer"
                              onClick={() => {
                                setSelectedContractor(contractor);
                                setShowDetailsSidebar(true);
                              }}
                            >
                              <div>
                                <p className="font-medium text-gray-900">
                                  {contractor.companyName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {contractor.contactEmail}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1 text-gray-600">
                                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                                <span>{contractor.primaryCity}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1">
                                {contractor.serviceTypes.slice(0, 2).map((s) => (
                                  <span
                                    key={s}
                                    className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded"
                                  >
                                    {s.split(" ")[0]}
                                  </span>
                                ))}
                                {contractor.serviceTypes.length > 2 && (
                                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                                    +{contractor.serviceTypes.length - 2}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-gray-600">
                                {contractor.yearsExperience} yrs
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                  getStatusColor(contractor.status).bg
                                } ${getStatusColor(contractor.status).text}`}
                              >
                                {getStatusColor(contractor.status).icon}
                                {contractor.status.charAt(0).toUpperCase() +
                                  contractor.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                <span className="font-medium">
                                  {contractor.rating.toFixed(1)}
                                </span>
                                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs text-gray-500">
                                  ({contractor.reviewsCount})
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-1">
                                <button
                                  onClick={() => {
                                    setSelectedContractor(contractor);
                                    setShowDetailsSidebar(true);
                                  }}
                                  className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                                  title="View"
                                >
                                  <Eye className="h-4 w-4 text-gray-600" />
                                </button>
                                <div className="relative group">
                                  <button className="p-1.5 hover:bg-gray-100 rounded transition-colors">
                                    <MoreVertical className="h-4 w-4 text-gray-600" />
                                  </button>
                                  <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                    <button
                                      onClick={() => {
                                        setSelectedContractor(contractor);
                                        setShowDetailsSidebar(true);
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                                    >
                                      <Eye className="h-4 w-4" />
                                      View Profile
                                    </button>
                                    {contractor.status === "pending" && (
                                      <>
                                        <button
                                          onClick={() =>
                                            handleApprove(contractor.id)
                                          }
                                          disabled={
                                            actionLoading ===
                                            contractor.id
                                          }
                                          className="w-full text-left px-4 py-2 text-sm hover:bg-green-50 text-green-700 flex items-center gap-2 disabled:opacity-50"
                                        >
                                          <Check className="h-4 w-4" />
                                          Approve
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleReject(contractor.id)
                                          }
                                          disabled={
                                            actionLoading ===
                                            contractor.id
                                          }
                                          className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-700 flex items-center gap-2 disabled:opacity-50"
                                        >
                                          <XCircle className="h-4 w-4" />
                                          Reject
                                        </button>
                                      </>
                                    )}
                                    <button
                                      onClick={() =>
                                        handleToggleFeatured(contractor.id)
                                      }
                                      disabled={actionLoading === contractor.id}
                                      className="w-full text-left px-4 py-2 text-sm hover:bg-purple-50 text-purple-700 flex items-center gap-2 disabled:opacity-50"
                                    >
                                      <TrendingUp className="h-4 w-4" />
                                      {contractor.featured
                                        ? "Unfeature"
                                        : "Feature"}
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleToggleSuspend(contractor.id)
                                      }
                                      disabled={actionLoading === contractor.id}
                                      className="w-full text-left px-4 py-2 text-sm hover:bg-orange-50 text-orange-700 flex items-center gap-2 disabled:opacity-50"
                                    >
                                      {contractor.status === "suspended" ? (
                                        <>
                                          <Shield className="h-4 w-4" />
                                          Activate
                                        </>
                                      ) : (
                                        <>
                                          <ShieldOff className="h-4 w-4" />
                                          Suspend
                                        </>
                                      )}
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDelete(contractor.id)
                                      }
                                      disabled={actionLoading === contractor.id}
                                      className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-700 flex items-center gap-2 disabled:opacity-50 border-t border-gray-200"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Filter Sidebar */}
          {filterOpen && (
            <div className="w-full lg:w-64 bg-white rounded-lg border border-gray-200 p-4 space-y-4 h-fit">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Type
                </label>
                <select
                  value={filters.serviceType}
                  onChange={(e) => {
                    setFilters({ ...filters, serviceType: e.target.value });
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">All Services</option>
                  {SERVICE_TYPES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Province
                </label>
                <select
                  value={filters.province}
                  onChange={(e) => {
                    setFilters({ ...filters, province: e.target.value });
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">All Provinces</option>
                  {PROVINCES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience
                </label>
                <select
                  value={filters.experienceLevel}
                  onChange={(e) => {
                    setFilters({
                      ...filters,
                      experienceLevel: e.target.value as any,
                    });
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner (0-4 years)</option>
                  <option value="intermediate">Intermediate (5-9 years)</option>
                  <option value="expert">Expert (10+ years)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min. Rating: {filters.ratingMin.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.1"
                  value={filters.ratingMin}
                  onChange={(e) => {
                    setFilters({
                      ...filters,
                      ratingMin: parseFloat(e.target.value),
                    });
                    setCurrentPage(1);
                  }}
                  className="w-full"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.featuredOnly}
                  onChange={(e) => {
                    setFilters({ ...filters, featuredOnly: e.target.checked });
                    setCurrentPage(1);
                  }}
                  className="rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">
                  Featured only
                </span>
              </label>

              <button
                onClick={() => {
                  setFilters({
                    status: "all",
                    serviceType: "",
                    province: "",
                    experienceLevel: "all",
                    featuredOnly: false,
                    ratingMin: 0,
                  });
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Details Sidebar */}
      {showDetailsSidebar && selectedContractor && (
        <div className="fixed inset-0 bg-black/50 z-40">
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-xl bg-white shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                Contractor Details
              </h2>
              <button
                onClick={() => setShowDetailsSidebar(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Company Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Company Information
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Company Name
                    </p>
                    <p className="font-medium text-gray-900">
                      {selectedContractor.companyName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Contact Name
                    </p>
                    <p className="font-medium text-gray-900">
                      {selectedContractor.contactName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Description
                    </p>
                    <p className="text-gray-700">
                      {selectedContractor.companyDescription ||
                        "No description provided"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Contact Information
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <a
                      href={`mailto:${selectedContractor.contactEmail}`}
                      className="text-purple-600 hover:underline"
                    >
                      {selectedContractor.contactEmail}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <a
                      href={`tel:${selectedContractor.contactPhone}`}
                      className="text-purple-600 hover:underline"
                    >
                      {selectedContractor.contactPhone}
                    </a>
                  </div>
                  {selectedContractor.website && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <a
                        href={selectedContractor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:underline"
                      >
                        {selectedContractor.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Service Details */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Service Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                      Service Types
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedContractor.serviceTypes.map((st) => (
                        <span
                          key={st}
                          className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm font-medium"
                        >
                          {st}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                      Service Areas
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedContractor.serviceAreas.map((sa) => (
                        <span
                          key={sa}
                          className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm"
                        >
                          {sa}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Experience
                    </p>
                    <p className="font-medium text-gray-900">
                      {selectedContractor.yearsExperience} years (
                      {getExperienceLevel(
                        selectedContractor.yearsExperience
                      )})
                    </p>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Location</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      City/Province
                    </p>
                    <p className="font-medium text-gray-900">
                      {selectedContractor.primaryCity},{" "}
                      {selectedContractor.province}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Full Address
                    </p>
                    <p className="text-gray-700">
                      {selectedContractor.fullAddress}
                    </p>
                  </div>
                </div>
              </div>

              {/* Certifications */}
              {selectedContractor.certifications.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Certifications
                  </h3>
                  <div className="space-y-2">
                    {selectedContractor.certifications.map((cert) => (
                      <div
                        key={cert.id}
                        className="p-3 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-start gap-2">
                          <Award className="h-4 w-4 text-purple-600 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {cert.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              by {cert.issuedBy}
                            </p>
                            <p className="text-xs text-gray-500">
                              Expires: {new Date(cert.expiryDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status & Rating */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Status & Performance
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                      Status
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                          statusColor?.bg
                        } ${statusColor?.text}`}
                      >
                        {statusColor?.icon}
                        {selectedContractor.status.charAt(0).toUpperCase() +
                          selectedContractor.status.slice(1)}
                      </span>
                      {selectedContractor.approvedAt && (
                        <span className="text-xs text-gray-500">
                          {new Date(
                            selectedContractor.approvedAt
                          ).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                      Rating
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-gray-900">
                        {selectedContractor.rating.toFixed(1)}
                      </span>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.round(selectedContractor.rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">
                        ({selectedContractor.reviewsCount} reviews)
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                      Featured
                    </p>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                        selectedContractor.featured
                          ? "bg-purple-100 text-purple-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {selectedContractor.featured ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Admin Notes</h3>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-700 min-h-24">
                  {selectedContractor.adminNotes ||
                    "No notes added yet. Add notes here..."}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                {selectedContractor.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleApprove(selectedContractor.id)}
                      disabled={actionLoading === selectedContractor.id}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                    >
                      {actionLoading === selectedContractor.id && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(selectedContractor.id)}
                      disabled={actionLoading === selectedContractor.id}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
                    >
                      {actionLoading === selectedContractor.id && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      Reject
                    </button>
                  </>
                )}
                {selectedContractor.status !== "pending" && (
                  <>
                    <button
                      onClick={() =>
                        handleToggleFeatured(selectedContractor.id)
                      }
                      disabled={actionLoading === selectedContractor.id}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
                    >
                      {actionLoading === selectedContractor.id && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      {selectedContractor.featured
                        ? "Unfeature"
                        : "Feature"}
                    </button>
                    <button
                      onClick={() =>
                        handleToggleSuspend(selectedContractor.id)
                      }
                      disabled={actionLoading === selectedContractor.id}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 font-medium"
                    >
                      {actionLoading === selectedContractor.id && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      {selectedContractor.status === "suspended"
                        ? "Activate"
                        : "Suspend"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
