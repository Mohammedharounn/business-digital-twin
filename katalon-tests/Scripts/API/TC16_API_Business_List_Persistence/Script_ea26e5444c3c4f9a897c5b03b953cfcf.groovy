import internal.GlobalVariable as GlobalVariable
String token = CustomKeywords.'com.bdt.ApiKeywords.getAuthToken'(GlobalVariable.TEST_EMAIL, GlobalVariable.TEST_PASSWORD)
def json = CustomKeywords.'com.bdt.ApiKeywords.getProjects'(token)
assert json.data instanceof List
println 'User has ' + json.data.size() + ' persisted project(s); activeProjectId=' + json.activeProjectId
