// Global test teardown
module.exports = async () => {
  console.log('🧹 Cleaning up test environment...')
  
  // Clean up test database if needed
  // Note: In a real scenario, you might want to clean up test data here
  
  // Log test run time
  if (global.__TEST_START_TIME__) {
    const duration = Date.now() - global.__TEST_START_TIME__
    console.log(`⏱️  Total test runtime: ${duration}ms`)
  }
  
  // Clean up any global resources
  delete global.__TEST_START_TIME__
  
  console.log('✅ Test environment cleanup complete')
}