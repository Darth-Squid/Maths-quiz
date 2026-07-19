class Solution(object):
    def __init__(self):
        pass

    def twoSum(self, nums, target):
        """
        :type nums: List[int]
        :type target: int
        :rtype: List[int]
        """

        val = [0, 1]
        found = False

        #for num1 in nums:
        #    for num2 in nums:
        #        temp = nums[:]

        #        if num1 + num2 == target:
        #            if nums.count(num1) > 1 or nums.count(num2) > 1:
        #                val[0] = temp.index(num1)
        #                temp[temp.index(num1)] = ""

        #                val[1] = temp.index(num2)

        #            elif num1 == num2:
        #                continue
        #            else:
        #                val[0] = temp.index(num1)
        #                val[1] = temp.index(num2)
        #            found = True
        #            break
        #    if found: break
        checked = {}
        print(nums)
        for i, item in enumerate(nums):

            ans = target - item

            if ans in checked.keys():
                val = [checked[ans], i]

            checked[item] = nums.index(item)

        return val


#print(Solution().twoSum([3, 2, 3], 6))

multiplication_times_tables_questions = {i: [(i, n) for n in range(1, 13)] for i in range(1, 13)}
division_times_tables_questions = {i: [(i, n * i) for n in range(1, 13)] for i in range(1, 13)}


print(multiplication_times_tables_questions)
print(division_times_tables_questions)