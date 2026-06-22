import internal.GlobalVariable as GlobalVariable
String token = CustomKeywords.'com.bdt.ApiKeywords.getAuthToken'(GlobalVariable.TEST_EMAIL, GlobalVariable.TEST_PASSWORD)
assert token != null && token.length() > 20
println 'Token OK (length ' + token.length() + ')'
