const { createApp, ref, computed, onMounted, watch } = Vue;

// 省份列表常量
const PROVINCE_LIST = ['北京', '天津', '河北', '山西', '内蒙古', '辽宁', '吉林', '黑龙江', '上海', '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南', '湖北', '湖南', '广东', '广西', '海南', '重庆', '四川', '贵州', '云南', '西藏', '陕西', '甘肃', '青海', '宁夏', '新疆'];

// 分页显示范围常量
const PAGINATION_RANGE = 2;

// 默认显示院校数量
const DEFAULT_COLLEGE_DISPLAY = 12;

createApp({
    setup() {
        const scores = ref({
            art: null,
            culture: null
        });
        const allData = ref([]);
        const recommendations = ref([]);
        const recommendationFilter = ref('');
        const selectedProvince = ref('');
        const currentPage = ref(1);
        const pageSize = 10;

        const searchQuery = ref('');
        const selectedMajor = ref(null);
        const userCompositeScore = ref(0);
        const referenceArtScore = ref(234);

        // 加载数据
        onMounted(async () => {
            try {
                const response = await fetch('data/scores.json');
                allData.value = await response.json();
            } catch (error) {
                console.error('加载数据失败:', error);
                alert('数据加载失败，请检查网络或数据文件。');
            }
        });

        // 计算综合分并推荐
        const calculateAndRecommend = () => {
            if (!scores.value.art || !scores.value.culture) {
                alert('请输入完整的分数信息！');
                return;
            }
            if (scores.value.art < 0 || scores.value.art > 300 || scores.value.culture < 0 || scores.value.culture > 750) {
                alert('请输入有效的分数范围（美术0-300，文化0-750）');
                return;
            }

            // 综合分 = 美术专业分 × 1.25 + 文化课分数 × 0.5
            userCompositeScore.value = scores.value.art * 1.25 + scores.value.culture * 0.5;

            // 清空搜索和筛选
            recommendationFilter.value = '';
            selectedProvince.value = '';

            // 过滤推荐院校：综合分低于或等于用户综合分，并按分数从高到低排序
            recommendations.value = allData.value
                .filter(item => item.min_composite_score <= userCompositeScore.value)
                .map(item => ({
                    ...item,
                    // 智能识别省份
                    province: PROVINCE_LIST.find(p => item.college_code_name.includes(p)) || '其他',
                    // 计算分数差值
                    diff: userCompositeScore.value - item.min_composite_score
                }))
                .sort((a, b) => b.min_composite_score - a.min_composite_score);
            
            currentPage.value = 1; // 重置页码

            if (recommendations.value.length === 0) {
                alert('抱歉，根据您的分数暂无匹配推荐院校。建议关注较低投档线的院校。');
            }
        };

        // 重置功能
        const resetForm = () => {
            scores.value = { art: null, culture: null };
            userCompositeScore.value = 0;
            recommendations.value = [];
            recommendationFilter.value = '';
            selectedProvince.value = '';
            currentPage.value = 1;
            referenceArtScore.value = 234;
        };



        // 获取推荐结果中的所有省份
        const availableProvinces = computed(() => {
            const provinces = recommendations.value.map(item => item.province);
            return [...new Set(provinces)].sort();
        });

        // 应用过滤后的推荐结果
        const filteredRecommendations = computed(() => {
            const filter = recommendationFilter.value.trim();
            const province = selectedProvince.value;
            
            return recommendations.value.filter(item => {
                // 关键词搜索匹配
                const matchSearch = !filter || 
                    item.college_code_name.includes(filter) || 
                    item.major_code_name.includes(filter);
                // 省份筛选匹配
                const matchProvince = !province || item.province === province;
                return matchSearch && matchProvince;
            });
        });

        // 分页后的推荐结果
        const paginatedRecommendations = computed(() => {
            const start = (currentPage.value - 1) * pageSize;
            return filteredRecommendations.value.slice(start, start + pageSize);
        });

        const totalPages = computed(() => {
            return Math.ceil(filteredRecommendations.value.length / pageSize) || 1;
        });

        // 动态计算文化课参考分
        // 公式反推：文化分 = (综合分 - 美术分×1.25) / 0.5
        const calcRefCultureScore = (minCompositeScore) => {
            const refArt = referenceArtScore.value || 0;
            const calculatedScore = (minCompositeScore - refArt * 1.25) / 0.5;
            return calculatedScore > 0 ? Math.ceil(calculatedScore) : 0;
        };

        // 监听筛选条件变化，重置页码
        watch([recommendationFilter, selectedProvince], () => {
            currentPage.value = 1;
        });

        // 院校列表（去重缓存）
        const allColleges = computed(() => {
            return [...new Set(allData.value.map(item => item.college_code_name))];
        });

        // 院校查询过滤
        const filteredColleges = computed(() => {
            const query = searchQuery.value.trim();
            if (!query) return allColleges.value.slice(0, DEFAULT_COLLEGE_DISPLAY);
            return allColleges.value.filter(name => name.includes(query));
        });

        // 选择院校查看详情
        const selectCollege = (collegeName) => {
            const majors = allData.value.filter(item => item.college_code_name === collegeName);
            if (majors.length > 0) {
                selectedMajor.value = majors[0];
            }
        };

        // 查看专业详情
        const showDetail = (major) => {
            selectedMajor.value = major;
        };

        // 获取该校其他专业
        const getOtherMajors = (collegeName) => {
            return allData.value.filter(item => item.college_code_name === collegeName);
        };

        return {
            scores,
            userCompositeScore,
            recommendations,
            recommendationFilter,
            selectedProvince,
            currentPage,
            availableProvinces,
            filteredRecommendations,
            paginatedRecommendations,
            totalPages,
            referenceArtScore,
            calcRefCultureScore,
            searchQuery,
            filteredColleges,
            selectedMajor,
            calculateAndRecommend,
            resetForm,
            selectCollege,
            showDetail,
            getOtherMajors
        };
    }
}).mount('#app');
