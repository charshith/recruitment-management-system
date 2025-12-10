<template>
  <div class="space-y-4 sm:space-y-6">
    <!-- Header -->
    <div class="mb-4 sm:mb-6">
      <button
        @click="$router.push('/dashboard')"
        class="flex items-center text-sm sm:text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-3 sm:mb-4 transition-colors duration-300 ease-in-out group"
      >
        <svg class="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        <span>Back to Dashboard</span>
      </button>
      <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white transition-colors duration-300 ease-in-out">{{ client?.name || 'Client Details' }}</h1>
    </div>

    <div v-if="loading" class="text-center py-12 sm:py-16">
      <div class="inline-block animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-primary-600"></div>
      <p class="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600 dark:text-gray-400">Loading client details...</p>
    </div>

    <div v-else-if="client" class="space-y-4 sm:space-y-6">
      <!-- Client Info Card -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6 transition-colors duration-300 ease-in-out">
        <h2 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300 ease-in-out">Client Information</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Email</p>
            <p class="text-sm sm:text-base font-medium text-gray-900 dark:text-white break-all">{{ client.email }}</p>
          </div>
          <div class="p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Daily Target</p>
            <p class="text-sm sm:text-base font-medium text-gray-900 dark:text-white">{{ client.dailyTarget }} jobs</p>
          </div>
          <div class="p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Today's Applications</p>
            <p class="text-sm sm:text-base font-medium text-gray-900 dark:text-white">{{ client.todayApplications }}</p>
          </div>
          <div class="p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Total Applications</p>
            <p class="text-sm sm:text-base font-medium text-gray-900 dark:text-white">{{ client.totalApplications }}</p>
          </div>
        </div>
      </div>

      <!-- Instructions Card -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6 transition-colors duration-300 ease-in-out">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Instructions</h2>
          <button
            v-if="!isEditingInstructions"
            @click="startEditingInstructions"
            class="p-2 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
            title="Edit instructions"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>
        
        <div v-if="!isEditingInstructions" class="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg p-4 sm:p-5 border border-gray-200 dark:border-gray-600">
          <p class="text-sm sm:text-base text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{{ client.instructions || 'No specific instructions provided.' }}</p>
        </div>
        
        <div v-else class="space-y-3">
          <textarea
            v-model="instructionsEdit"
            rows="6"
            class="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            placeholder="Enter instructions for this client..."
          ></textarea>
          <div class="flex gap-3 justify-end">
            <button
              @click="cancelEditingInstructions"
              class="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              @click="saveInstructions"
              :disabled="instructionsLoading"
              class="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <span v-if="instructionsLoading" class="flex items-center gap-2">
                <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
              <span v-else>Save</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Session Management -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6 transition-colors duration-300 ease-in-out">
        <h2 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">Session Management</h2>
        
        <!-- Active Session Card -->
        <div v-if="activeSession" class="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-green-200 dark:border-green-800">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-3">
              <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <h3 class="text-base font-semibold text-green-800 dark:text-green-300">Active Session</h3>
            </div>
            <span class="text-xs text-green-600 dark:text-green-400 font-medium">{{ formatSessionDuration(activeSession.startTime) }}</span>
          </div>
          <div class="grid grid-cols-2 gap-3 mb-4">
            <div class="bg-white dark:bg-gray-800 rounded-lg p-3">
              <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">Started</p>
              <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ formatTime(activeSession.startTime) }}</p>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-lg p-3">
              <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">Duration</p>
              <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ formatSessionDuration(activeSession.startTime) }}</p>
            </div>
          </div>
          <button
            @click="showEndSessionConfirm = true"
            :disabled="sessionLoading"
            class="w-full px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold text-sm hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10h6v4H9z" />
            </svg>
            End Session
          </button>
        </div>

        <!-- Start Session Button -->
        <button
          v-else
          @click="startSession"
          :disabled="sessionLoading"
          class="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold text-base hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none flex items-center justify-center gap-3"
        >
          <span v-if="sessionLoading" class="flex items-center gap-2">
            <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Starting...
          </span>
          <span v-else class="flex items-center gap-2">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Start Applying Session
          </span>
        </button>

        <!-- Previous Sessions -->
        <div v-if="previousSessions.length > 0" class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Previous Sessions</h3>
          <div class="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
            <div
              v-for="session in previousSessions"
              :key="session.id"
              class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <svg class="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span class="text-xs font-medium text-gray-600 dark:text-gray-400">{{ formatDate(session.endTime) }}</span>
                  </div>
                  <div class="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>{{ formatTime(session.startTime) }} - {{ formatTime(session.endTime) }}</span>
                    <span class="flex items-center gap-1">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {{ session.duration?.formatted || 'N/A' }}
                    </span>
                    <span class="flex items-center gap-1">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {{ session.jobsApplied || 0 }} jobs
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- End Session Confirmation Dialog -->
      <ConfirmDialog
        :is-open="showEndSessionConfirm"
        title="End Session?"
        message="Are you sure you want to end this session?"
        :details="activeSession ? {
          'Started At': formatTime(activeSession.startTime),
          'Duration': formatSessionDuration(activeSession.startTime)
        } : null"
        confirm-text="Yes, End Session"
        cancel-text="Cancel"
        :loading="sessionLoading"
        loading-text="Ending..."
        @confirm="endSession"
        @cancel="showEndSessionConfirm = false"
      />

      <!-- Job Logging Form -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6 transition-colors duration-300 ease-in-out">
        <h2 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">Add Job Application</h2>
        <form @submit.prevent="addJob" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Company Name *</label>
              <input
                v-model="jobForm.companyName"
                type="text"
                required
                class="w-full px-4 py-2.5 sm:py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Enter company name"
              />
            </div>
            <div>
              <label class="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Job Title / Role *</label>
              <input
                v-model="jobForm.jobTitle"
                type="text"
                required
                class="w-full px-4 py-2.5 sm:py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Enter job title"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Job Link *</label>
            <input
              v-model="jobForm.jobLink"
              type="url"
              required
              class="w-full px-4 py-2.5 sm:py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="https://..."
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Location (optional)</label>
              <input
                v-model="jobForm.location"
                type="text"
                class="w-full px-4 py-2.5 sm:py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="City, State"
              />
            </div>
            <div>
              <label class="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Status *</label>
              <select
                v-model="jobForm.status"
                required
                class="w-full px-4 py-2.5 sm:py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="Applied">Applied</option>
                <option value="To be Applied">To be Applied</option>
                <option value="Not Fit">Not Fit</option>
                <option value="Duplicate">Duplicate</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Notes (optional)</label>
            <textarea
              v-model="jobForm.notes"
              rows="3"
              class="w-full px-4 py-2.5 sm:py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-sm sm:text-base resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="Additional notes..."
            ></textarea>
          </div>


          <button
            type="submit"
            :disabled="jobLoading"
            class="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold text-sm sm:text-base hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none flex items-center justify-center gap-2"
          >
            <span v-if="jobLoading" class="flex items-center gap-2">
              <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Adding...
            </span>
            <span v-else class="flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Job
            </span>
          </button>
        </form>
      </div>

      <!-- Job Log -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300 ease-in-out">
        <div class="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 transition-colors duration-300 ease-in-out">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h2 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-300 ease-in-out">Job Log</h2>
              <p class="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300 ease-in-out">All jobs applied for this client</p>
            </div>
            
            <!-- Search and Filters -->
            <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <!-- Search Input -->
              <div class="relative flex-1 sm:min-w-[200px]">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  v-model="searchQuery"
                  @input="handleSearchFilterChange"
                  type="text"
                  placeholder="Search jobs..."
                  class="w-full pl-10 pr-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
              
              <!-- Status Filter -->
              <select
                v-model="statusFilter"
                @change="handleSearchFilterChange"
                class="px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Status</option>
                <option value="Applied">Applied</option>
                <option value="To be Applied">To be Applied</option>
                <option value="Not Fit">Not Fit</option>
                <option value="Duplicate">Duplicate</option>
              </select>
            </div>
          </div>
          
          <!-- Results Count and Export -->
          <div class="flex items-center justify-between">
            <div class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300 ease-in-out">
              Showing {{ filteredJobs.length }} of {{ totalJobs }} jobs
              <span v-if="totalPages > 1" class="ml-2">(Page {{ currentPage }} of {{ totalPages }})</span>
            </div>
            <div class="flex gap-2">
              <button
                @click="exportToCSV"
                class="px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center gap-1.5"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                CSV
              </button>
              <button
                @click="exportToExcel"
                class="px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center gap-1.5"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Excel
              </button>
            </div>
          </div>
        </div>

        <div v-if="jobsLoading" class="p-6 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400"></div>
        </div>

        <div v-else-if="jobs.length === 0" class="p-8 sm:p-12 text-center">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
            <svg class="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 class="text-sm sm:text-base font-medium text-gray-900 dark:text-white mb-1">No jobs logged yet</h3>
          <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Start adding jobs using the form above.</p>
        </div>

        <div v-else class="overflow-x-auto custom-scrollbar">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                <th class="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Company</th>
                <th class="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Job Title</th>
                <th class="hidden sm:table-cell px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location</th>
                <th class="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th class="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Link</th>
                <th class="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-if="filteredJobs.length === 0" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td colspan="7" class="px-4 sm:px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  No jobs found matching your search criteria
                </td>
              </tr>
              <tr v-for="job in filteredJobs" :key="job.id" class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 dark:text-white">{{ formatDate(job.date) }}</td>
                <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{{ job.companyName }}</td>
                <td class="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-900 dark:text-white max-w-xs truncate">{{ job.jobTitle }}</td>
                <td class="hidden sm:table-cell px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-400">{{ job.location || '-' }}</td>
                <td class="px-4 sm:px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-2 py-1 text-xs font-semibold rounded-full"
                    :class="{
                      'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300': job.status === 'Applied',
                      'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300': job.status === 'To be Applied',
                      'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300': job.status === 'Not Fit',
                      'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300': job.status === 'Duplicate'
                    }"
                  >
                    {{ job.status }}
                  </span>
                </td>
                <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm">
                  <a
                    :href="job.jobLink"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium flex items-center gap-1 transition-colors"
                  >
                    View
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </td>
                <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm">
                  <div class="flex items-center gap-2">
                    <button
                      @click="openEditModal(job)"
                      class="p-1.5 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                      title="Edit job"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      @click="confirmDelete(job)"
                      class="p-1.5 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete job"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls -->
        <div v-if="totalPages > 1" class="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="text-sm text-gray-600 dark:text-gray-400">
              Page <span class="font-semibold text-gray-900 dark:text-white">{{ currentPage }}</span> of 
              <span class="font-semibold text-gray-900 dark:text-white">{{ totalPages }}</span>
              ({{ totalJobs }} total jobs)
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="prevPage"
                :disabled="currentPage === 1 || jobsLoading"
                class="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
              
              <!-- Page Numbers -->
              <div class="flex items-center gap-1">
                <button
                  v-for="page in Math.min(5, totalPages)"
                  :key="page"
                  @click="goToPage(page)"
                  :class="[
                    'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    currentPage === page
                      ? 'bg-primary-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  ]"
                >
                  {{ page }}
                </button>
                <span v-if="totalPages > 5" class="px-2 text-gray-500 dark:text-gray-400">...</span>
                <button
                  v-if="totalPages > 5"
                  @click="goToPage(totalPages)"
                  :class="[
                    'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    currentPage === totalPages
                      ? 'bg-primary-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  ]"
                >
                  {{ totalPages }}
                </button>
              </div>
              
              <button
                @click="nextPage"
                :disabled="currentPage === totalPages || jobsLoading"
                class="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                Next
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Job Modal -->
    <EditJobModal
      :is-open="isEditModalOpen"
      :job="selectedJob"
      @close="closeEditModal"
      @updated="handleJobUpdated"
    />

    <!-- Delete Job Confirm Dialog -->
    <ConfirmDialog
      v-model="showDeleteConfirm"
      title="Delete Job"
      :message="jobToDelete ? `Are you sure you want to delete this job?\n\nCompany: ${jobToDelete.companyName}\nTitle: ${jobToDelete.jobTitle}` : ''"
      confirm-text="Delete"
      cancel-text="Cancel"
      confirm-class="bg-red-600 hover:bg-red-700"
      @confirm="handleDeleteConfirm"
      @cancel="jobToDelete = null"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/services/api'
import { useToastStore } from '@/stores/toast'
import { exportToCSV as exportCSV, exportToExcel as exportXLSX } from '@/utils/export'
import EditJobModal from '@/components/EditJobModal.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const route = useRoute()
const clientId = route.params.clientId
const toastStore = useToastStore()

const loading = ref(true)
const jobsLoading = ref(false)
const client = ref(null)
const jobs = ref([])
const activeSession = ref(null)
const sessionLoading = ref(false)
const previousSessions = ref([])
const showEndSessionConfirm = ref(false)

const jobForm = ref({
  companyName: '',
  jobTitle: '',
  jobLink: '',
  location: '',
  status: 'Applied',
  notes: ''
})

const jobLoading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')

// Pagination state
const currentPage = ref(1)
const pageSize = ref(50)
const totalJobs = ref(0)
const totalPages = ref(0)

// Edit modal state
const isEditModalOpen = ref(false)
const selectedJob = ref(null)

// Instructions editing state
const isEditingInstructions = ref(false)
const instructionsEdit = ref('')
const instructionsLoading = ref(false)

// Filtered jobs - now just returns current page jobs (filtering done on backend)
const filteredJobs = computed(() => {
  return jobs.value
})

// Pagination functions
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchJobs()
    // Scroll to top of job table
    const jobTable = document.querySelector('.overflow-x-auto')
    if (jobTable) {
      jobTable.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    goToPage(currentPage.value + 1)
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    goToPage(currentPage.value - 1)
  }
}

const fetchClientDetails = async () => {
  try {
    loading.value = true
    const response = await api.get(`/clients/${clientId}`)
    client.value = response.data
    // Jobs are now fetched separately with pagination
    await fetchJobs()
  } catch (error) {
    toastStore.error(error.response?.data?.error || 'Failed to load client details')
  } finally {
    loading.value = false
  }
}

// Fetch jobs with pagination
const fetchJobs = async () => {
  try {
    jobsLoading.value = true
    const params = {
      page: currentPage.value,
      limit: pageSize.value
    }
    
    // Add search and status filter to params if they exist
    if (searchQuery.value.trim()) {
      params.search = searchQuery.value.trim()
    }
    if (statusFilter.value) {
      params.status = statusFilter.value
    }
    
    const response = await api.get(`/jobs/client/${clientId}`, { params })
    jobs.value = response.data.jobs || []
    totalJobs.value = response.data.pagination?.total || 0
    totalPages.value = response.data.pagination?.totalPages || 0
  } catch (error) {
    toastStore.error(error.response?.data?.error || 'Failed to load jobs')
  } finally {
    jobsLoading.value = false
  }
}

// Watch for search/filter changes and reset to page 1
const handleSearchFilterChange = () => {
  currentPage.value = 1
  fetchJobs()
}

const fetchActiveSession = async () => {
  try {
    const [activeResponse, historyResponse] = await Promise.all([
      api.get(`/sessions/client/${clientId}/active`),
      api.get(`/sessions/client/${clientId}/history`, { params: { limit: 5 } })
    ])
    activeSession.value = activeResponse.data
    previousSessions.value = historyResponse.data || []
  } catch (error) {
  }
}

const startSession = async () => {
  try {
    sessionLoading.value = true
    await api.post('/sessions/start', { clientId })
    await fetchActiveSession()
    toastStore.success('Session started successfully!')
  } catch (error) {
    toastStore.error(error.response?.data?.error || 'Failed to start session')
  } finally {
    sessionLoading.value = false
  }
}

const endSession = async () => {
  try {
    sessionLoading.value = true
    await api.post('/sessions/end', { clientId })
    activeSession.value = null
    showEndSessionConfirm.value = false
    await Promise.all([fetchClientDetails(), fetchActiveSession()]) // Refresh to update today's count and session history
    toastStore.success('Session ended successfully!')
  } catch (error) {
    toastStore.error(error.response?.data?.error || 'Failed to end session')
    showEndSessionConfirm.value = false
  } finally {
    sessionLoading.value = false
  }
}

const addJob = async () => {
  try {
    jobLoading.value = true

    await api.post('/jobs', {
      clientId,
      ...jobForm.value
    })

    // Reset form
    jobForm.value = {
      companyName: '',
      jobTitle: '',
      jobLink: '',
      location: '',
      status: 'Applied',
      notes: ''
    }

    toastStore.success('Job added successfully!')

    // Refresh client details and jobs list
    await fetchClientDetails()
    // Reset to first page to show new job
    currentPage.value = 1
    await fetchJobs()
    // Dispatch custom event for dashboard to refresh
    window.dispatchEvent(new CustomEvent('job-added'))
  } catch (error) {
    toastStore.error(error.response?.data?.error || 'Failed to add job')
  } finally {
    jobLoading.value = false
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const formatTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

const formatSessionDuration = (startTime) => {
  const start = new Date(startTime)
  const now = new Date()
  const diffMs = now - start
  const diffMinutes = Math.floor(diffMs / 1000 / 60)
  const hours = Math.floor(diffMinutes / 60)
  const minutes = diffMinutes % 60
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

// Edit job functions
const openEditModal = (job) => {
  selectedJob.value = job
  isEditModalOpen.value = true
}

const closeEditModal = () => {
  isEditModalOpen.value = false
  selectedJob.value = null
}

const handleJobUpdated = async () => {
  await Promise.all([fetchClientDetails(), fetchJobs()])
  window.dispatchEvent(new CustomEvent('job-added'))
  toastStore.success('Job updated successfully!')
}

// Instructions editing functions
const startEditingInstructions = () => {
  instructionsEdit.value = client.value?.instructions || ''
  isEditingInstructions.value = true
}

const cancelEditingInstructions = () => {
  isEditingInstructions.value = false
  instructionsEdit.value = ''
}

const saveInstructions = async () => {
  try {
    instructionsLoading.value = true
    await api.put(`/clients/${clientId}/instructions`, {
      instructions: instructionsEdit.value
    })
    
    // Update local client data
    if (client.value) {
      client.value.instructions = instructionsEdit.value
    }
    
    isEditingInstructions.value = false
    toastStore.success('Instructions updated successfully!')
  } catch (error) {
    toastStore.error(error.response?.data?.error || 'Failed to update instructions')
  } finally {
    instructionsLoading.value = false
  }
}

// Delete job functions
const showDeleteConfirm = ref(false)
const jobToDelete = ref(null)

const confirmDelete = (job) => {
  jobToDelete.value = job
  showDeleteConfirm.value = true
}

const handleDeleteConfirm = async () => {
  if (jobToDelete.value) {
    await deleteJob(jobToDelete.value.id)
    showDeleteConfirm.value = false
    jobToDelete.value = null
  }
}

const deleteJob = async (jobId) => {
  try {
    await api.delete(`/jobs/${jobId}`)
    toastStore.success('Job deleted successfully!')
    await Promise.all([fetchClientDetails(), fetchJobs()])
    window.dispatchEvent(new CustomEvent('job-added'))
  } catch (error) {
    toastStore.error(error.response?.data?.error || 'Failed to delete job')
  }
}

// Listen for job added event
const handleJobAdded = () => {
  fetchClientDetails()
  fetchActiveSession()
}

onMounted(async () => {
  await Promise.all([fetchClientDetails(), fetchActiveSession()])
  window.addEventListener('job-added', handleJobAdded)
})

// Watch for search/filter changes with debounce
let searchTimeout = null
watch([searchQuery, statusFilter], () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handleSearchFilterChange()
  }, 500) // Debounce 500ms
})

// Export functions
const exportToCSV = () => {
  try {
    if (filteredJobs.value.length === 0) {
      toastStore.warning('No jobs to export')
      return
    }
    exportCSV(filteredJobs.value, `${client.value?.name || 'jobs'}-export`)
    toastStore.success('CSV exported successfully!')
  } catch (error) {
    toastStore.error(error.message || 'Failed to export CSV')
  }
}

const exportToExcel = () => {
  try {
    if (filteredJobs.value.length === 0) {
      toastStore.warning('No jobs to export')
      return
    }
    exportXLSX(filteredJobs.value, `${client.value?.name || 'jobs'}-export`)
    toastStore.success('Excel file exported successfully!')
  } catch (error) {
    toastStore.error(error.message || 'Failed to export Excel')
  }
}

// Cleanup
onUnmounted(() => {
  window.removeEventListener('job-added', handleJobAdded)
})
</script>
