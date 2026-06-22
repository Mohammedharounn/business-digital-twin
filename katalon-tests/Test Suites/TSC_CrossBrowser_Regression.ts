<?xml version="1.0" encoding="UTF-8"?>
<TestSuiteCollectionEntity>
   <description>Runs the full regression suite across Chrome, Firefox and Edge.</description>
   <name>TSC_CrossBrowser_Regression</name>
   <tag></tag>
   <executionMode>SEQUENTIAL</executionMode>
   <maxConcurrentInstances>3</maxConcurrentInstances>
   <testSuiteRunConfigurations>
      <TestSuiteRunConfiguration>
         <testSuiteEntity>Test Suites/TS_Regression</testSuiteEntity>
         <runConfigurationId>Chrome</runConfigurationId>
         <runEnabled>true</runEnabled>
         <profileName>default</profileName>
         <executionProfileEnabled>true</executionProfileEnabled>
         <browserType>Chrome</browserType>
      </TestSuiteRunConfiguration>
      <TestSuiteRunConfiguration>
         <testSuiteEntity>Test Suites/TS_Regression</testSuiteEntity>
         <runConfigurationId>Firefox</runConfigurationId>
         <runEnabled>true</runEnabled>
         <profileName>default</profileName>
         <executionProfileEnabled>true</executionProfileEnabled>
         <browserType>Firefox</browserType>
      </TestSuiteRunConfiguration>
      <TestSuiteRunConfiguration>
         <testSuiteEntity>Test Suites/TS_Regression</testSuiteEntity>
         <runConfigurationId>Edge</runConfigurationId>
         <runEnabled>true</runEnabled>
         <profileName>default</profileName>
         <executionProfileEnabled>true</executionProfileEnabled>
         <browserType>Edge Chromium</browserType>
      </TestSuiteRunConfiguration>
   </testSuiteRunConfigurations>
</TestSuiteCollectionEntity>
