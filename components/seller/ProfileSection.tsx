"use client";

import { useState } from "react";
import { User, Users, Mail, Phone, MapPin, Edit, Save, Upload, Shield, CheckCircle, AlertCircle, Camera, Package, ShoppingCart, TrendingUp, Eye, Star } from "lucide-react";

export default function ProfileSection() {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("business");

  const businessInfo = {
    businessName: "China Plus Group",
    businessEmail: "chinaplusgroup@gmail.com",
    businessPhone: "+1 (555) 123-4567",
    businessAddress: "123 Commerce Street, Toronto, ON, Canada",
    businessLogo: "/api/placeholder/logo",
    description: "Professional logistics and supply chain solutions for Canadian businesses",
    established: "2020",
  };

  const stats = {
    totalProducts: 248,
    activeListings: 198,
    pendingApproval: 12,
    monthlyViews: 18420,
    conversionRate: 3.2,
    averageRating: 4.8,
  };

  const verificationStatus = {
    email: "verified",
    phone: "verified",
    address: "pending",
    business: "verified",
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Business Profile</h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            {isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
            {isEditing ? "Save Changes" : "Edit Profile"}
          </button>
        </div>

        {/* Business Info Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Business Logo */}
          <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white mb-4">
              <Camera className="h-8 w-8" />
            </div>
            <button className="mt-4 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Upload className="h-4 w-4 mr-2" />
              Upload Logo
            </button>
          </div>

          {/* Business Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Business Name</label>
                <input
                  type="text"
                  defaultValue={businessInfo.businessName}
                  disabled={!isEditing}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Business Email</label>
                <input
                  type="email"
                  defaultValue={businessInfo.businessEmail}
                  disabled={!isEditing}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Business Phone</label>
                <input
                  type="tel"
                  defaultValue={businessInfo.businessPhone}
                  disabled={!isEditing}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              <div className="flex items-start justify-between">
                <label className="text-sm font-medium text-gray-700">Business Address</label>
                <textarea
                  defaultValue={businessInfo.businessAddress}
                  disabled={!isEditing}
                  rows={3}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Verification Status */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Status</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  verificationStatus.email === "verified" ? "bg-green-500" : "bg-yellow-500"
                }`}>
                  <Mail className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Email Verification</p>
                  <p className={`text-xs ${
                    verificationStatus.email === "verified" ? "text-green-600" : "text-yellow-600"
                  }`}>
                    {verificationStatus.email === "verified" ? "Verified" : "Pending"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    verificationStatus.phone === "verified" ? "bg-green-500" : "bg-yellow-500"
                  }`}>
                    <Phone className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Phone Verification</p>
                    <p className={`text-xs ${
                      verificationStatus.phone === "verified" ? "text-green-600" : "text-yellow-600"
                    }`}>
                      {verificationStatus.phone === "verified" ? "Verified" : "Pending"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    verificationStatus.business === "verified" ? "bg-green-500" : "bg-yellow-500"
                  }`}>
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Business Verification</p>
                    <p className={`text-xs ${
                      verificationStatus.business === "verified" ? "text-green-600" : "text-yellow-600"
                    }`}>
                      {verificationStatus.business === "verified" ? "Verified" : "Pending"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    verificationStatus.address === "verified" ? "bg-green-500" : "bg-yellow-500"
                  }`}>
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Address Verification</p>
                    <p className={`text-xs ${
                      verificationStatus.address === "verified" ? "text-green-600" : "text-yellow-600"
                    }`}>
                      {verificationStatus.address === "verified" ? "Verified" : "Pending"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Complete all verifications</strong> to unlock premium features and increase buyer trust.
              </p>
            </div>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Stats</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white">
                  <Package className="h-4 w-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              <p className="text-sm text-gray-600">Total Products</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.activeListings}</p>
              <p className="text-sm text-gray-600">Active Listings</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingApproval}</p>
              <p className="text-sm text-gray-600">Pending Approval</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Eye className="h-6 w-6 text-gray-800" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.monthlyViews.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Monthly Views</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.conversionRate}%</p>
              <p className="text-sm text-gray-600">Conversion Rate</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Users className="h-6 w-6 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
              <p className="text-sm text-gray-600">Average Rating</p>
            </div>
          </div>
        </div>

        {/* Business Description */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Description</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Business Description</label>
              <textarea
                defaultValue={businessInfo.description}
                disabled={!isEditing}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 resize-none"
                placeholder="Describe your business, products, and services..."
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Established Since</label>
              <input
                type="text"
                defaultValue={businessInfo.established}
                disabled={!isEditing}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
