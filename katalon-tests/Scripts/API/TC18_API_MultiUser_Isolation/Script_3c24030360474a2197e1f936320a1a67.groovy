import internal.GlobalVariable as GlobalVariable
// Each user must only ever see their own projects.
String t1 = CustomKeywords.'com.bdt.ApiKeywords.getAuthToken'(GlobalVariable.TEST_EMAIL, GlobalVariable.TEST_PASSWORD)
String t2 = CustomKeywords.'com.bdt.ApiKeywords.getAuthToken'(GlobalVariable.TEST_EMAIL_2, GlobalVariable.TEST_PASSWORD_2)
def u1 = CustomKeywords.'com.bdt.ApiKeywords.getProjects'(t1)
def u2 = CustomKeywords.'com.bdt.ApiKeywords.getProjects'(t2)
def ids1 = u1.data.collect { it._id } as Set
def ids2 = u2.data.collect { it._id } as Set
def overlap = ids1.intersect(ids2)
assert overlap.isEmpty() : 'ISOLATION BREACH: shared project ids ' + overlap
println 'Isolation OK. user1=' + ids1.size() + ' projects, user2=' + ids2.size() + ' projects, overlap=0'
