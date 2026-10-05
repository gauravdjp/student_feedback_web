/**
 * Student Feedback System - Angular Application
 * Technologies: AngularJS, Forms, REST API & MongoDB
 */

(function () {
  'use strict';

  var app = angular.module('studentFeedbackApp', []);

  app.controller('FeedbackController', ['$http', '$timeout', function ($http, $timeout) {
    var vm = this;

    // Application State
    vm.activeTab = 'form'; // 'form' | 'list' | 'analytics'
    vm.feedbacks = [];
    vm.stats = {
      total: 0,
      avgRating: 0.0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      courseDistribution: {}
    };
    vm.loading = false;
    vm.submitting = false;
    vm.dbConnected = false;
    vm.dbStatus = 'Checking...';

    // Form Model
    vm.departmentList = [
      'Computer Science & Engineering',
      'Information Technology',
      'Artificial Intelligence & Data Science',
      'Electronics & Communication',
      'Electrical & Electronics Engineering',
      'Mechanical Engineering',
      'Civil Engineering',
      'Master of Business Administration (MBA)'
    ];

    function getInitialFormData() {
      return {
        studentName: '',
        studentId: '',
        studentEmail: '',
        course: '',
        subject: '',
        teacherName: '',
        semester: 'Semester 4',
        academicYear: '2025-2026',
        rating: 0,
        ratings: {
          content: 5,
          delivery: 5,
          labSupport: 4,
          availability: 5
        },
        comments: '',
        suggestions: ''
      };
    }

    vm.formData = getInitialFormData();
    vm.hoverStar = 0;

    // Search and Filters
    vm.searchQuery = '';
    vm.filterCourse = '';
    vm.filterRating = '';

    // Toast Notifications
    vm.toast = {
      visible: false,
      message: '',
      type: 'success'
    };

    function showToast(msg, type) {
      vm.toast.message = msg;
      vm.toast.type = type || 'success';
      vm.toast.visible = true;
      $timeout(function () {
        vm.toast.visible = false;
      }, 4500);
    }

    // Tab Navigation
    vm.setTab = function (tabName) {
      vm.activeTab = tabName;
      if (tabName === 'list') {
        vm.loadFeedbacks();
      } else if (tabName === 'analytics') {
        vm.loadStats();
      }
    };

    // Star Rating Helper
    vm.setRating = function (star) {
      vm.formData.rating = star;
    };

    vm.getRatingLabel = function (rating) {
      switch (Number(rating)) {
        case 5: return 'Outstanding / Exceptional';
        case 4: return 'Very Good / Thorough';
        case 3: return 'Good / Satisfactory';
        case 2: return 'Needs Work / Adequate';
        case 1: return 'Unsatisfactory';
        default: return '';
      }
    };

    vm.renderStars = function (rating) {
      var r = Math.round(Number(rating)) || 0;
      var out = '';
      for (var i = 0; i < r; i++) out += '★';
      for (var j = r; j < 5; j++) out += '☆';
      return out;
    };

    vm.getRatingClass = function (rating) {
      var r = Math.round(Number(rating));
      return 'rating-' + r;
    };

    vm.getInitials = function (name) {
      if (!name) return 'ST';
      var parts = name.trim().split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    };

    vm.formatDate = function (dateStr) {
      if (!dateStr) return 'Recently';
      var d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // Check Backend & Database Health
    vm.checkHealth = function () {
      $http.get('/api/health')
        .then(function (res) {
          if (res.data && res.data.mongoReadyState === 1) {
            vm.dbConnected = true;
            vm.dbStatus = 'MongoDB Connected';
          } else {
            vm.dbConnected = false;
            vm.dbStatus = 'Standby / Local Storage';
          }
        })
        .catch(function () {
          vm.dbConnected = false;
          vm.dbStatus = 'Offline';
        });
    };

    // Load All Feedbacks
    vm.loadFeedbacks = function () {
      vm.loading = true;
      $http.get('/api/feedback')
        .then(function (res) {
          vm.feedbacks = res.data.data || [];
          vm.loading = false;
          vm.loadStats();
        })
        .catch(function (err) {
          vm.loading = false;
          showToast('Failed to load feedbacks from server.', 'error');
          console.error(err);
        });
    };

    // Load Stats
    vm.loadStats = function () {
      $http.get('/api/feedback/stats')
        .then(function (res) {
          vm.stats = res.data;
        })
        .catch(function (err) {
          console.warn('Could not load statistics:', err);
        });
    };

    // Submit Feedback Form
    vm.submitForm = function (form) {
      if (form.$invalid || vm.formData.rating === 0) {
        showToast('Please correct the highlighted errors in the form before submitting.', 'error');
        return;
      }

      vm.submitting = true;
      $http.post('/api/feedback', vm.formData)
        .then(function (res) {
          vm.submitting = false;
          showToast('Feedback submitted successfully and saved to database!', 'success');
          vm.resetForm(form);
          vm.loadFeedbacks();
          // Navigate to feedbacks explorer
          $timeout(function () {
            vm.setTab('list');
          }, 800);
        })
        .catch(function (err) {
          vm.submitting = false;
          var msg = (err.data && err.data.message) ? err.data.message : 'Error submitting feedback. Please try again.';
          showToast(msg, 'error');
        });
    };

    // Reset Form
    vm.resetForm = function (form) {
      vm.formData = getInitialFormData();
      if (form) {
        form.$setPristine();
        form.$setUntouched();
      }
    };

    // Delete Feedback
    vm.deleteFeedback = function (id) {
      if (!confirm('Are you sure you want to delete this feedback record?')) {
        return;
      }

      $http.delete('/api/feedback/' + id)
        .then(function () {
          showToast('Feedback deleted successfully.', 'success');
          vm.feedbacks = vm.feedbacks.filter(function (f) {
            return f._id !== id;
          });
          vm.loadStats();
        })
        .catch(function (err) {
          showToast('Failed to delete feedback.', 'error');
          console.error(err);
        });
    };

    // Filter Logic for Tab 2
    vm.filteredFeedbacks = function () {
      return vm.feedbacks.filter(function (item) {
        // Course Filter
        if (vm.filterCourse && item.course !== vm.filterCourse) {
          return false;
        }

        // Rating Filter
        if (vm.filterRating && Number(item.rating) < Number(vm.filterRating)) {
          return false;
        }

        // Search Query
        if (vm.searchQuery) {
          var q = vm.searchQuery.toLowerCase();
          var sName = (item.studentName || '').toLowerCase();
          var sId = (item.studentId || '').toLowerCase();
          var tName = (item.teacherName || '').toLowerCase();
          var course = (item.course || '').toLowerCase();
          var subject = (item.subject || '').toLowerCase();
          return sName.indexOf(q) !== -1 ||
                 sId.indexOf(q) !== -1 ||
                 tName.indexOf(q) !== -1 ||
                 course.indexOf(q) !== -1 ||
                 subject.indexOf(q) !== -1;
        }

        return true;
      });
    };

    vm.clearFilters = function () {
      vm.searchQuery = '';
      vm.filterCourse = '';
      vm.filterRating = '';
    };

    // Analytics Helpers
    vm.getStarPercent = function (star) {
      if (!vm.stats.total || vm.stats.total === 0) return 0;
      var count = vm.stats.ratingDistribution[star] || 0;
      return Math.round((count / vm.stats.total) * 100);
    };

    vm.getTopRatingPercent = function () {
      if (!vm.stats.total || vm.stats.total === 0) return 0;
      var count = vm.stats.ratingDistribution[5] || 0;
      return Math.round((count / vm.stats.total) * 100);
    };

    vm.getUniqueDepartmentsCount = function () {
      if (!vm.stats.courseDistribution) return 0;
      return Object.keys(vm.stats.courseDistribution).length;
    };

    vm.isEmptyObject = function (obj) {
      return !obj || Object.keys(obj).length === 0;
    };

    // Initial Execution
    vm.checkHealth();
    vm.loadFeedbacks();
    vm.loadStats();
  }]);
})();
