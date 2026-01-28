const { createApp, ref, computed, onMounted, watch } = Vue;

// 省份列表常量
const PROVINCE_LIST = ['北京', '天津', '河北', '山西', '内蒙古', '辽宁', '吉林', '黑龙江', '上海', '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南', '湖北', '湖南', '广东', '广西', '海南', '重庆', '四川', '贵州', '云南', '西藏', '陕西', '甘肃', '青海', '宁夏', '新疆'];

// 省份关键词映射（用于更精确的省份识别）
const PROVINCE_KEYWORDS = {
    '山东': ['山东', '青岛', '济南', '烟台', '潍坊', '临沂', '菏泽', '德州', '聊城', '泰山', '枣庄', '齐鲁', '威海', '淄博', '东营', '日照', '莱芜', '滨州'],
    '北京': ['北京', '首都', '中央', '北方工业', '北京联合', '北京城市'],
    '天津': ['天津', '天商'],
    '河北': ['河北', '石家庄', '唐山', '保定', '邯郸', '秦皇岛', '张家口', '承德', '廊坊', '沧州', '衡水', '邢台', '燕山'],
    '山西': ['山西', '太原', '大同', '晋中', '运城', '临汾', '长治', '晋城'],
    '内蒙古': ['内蒙古', '呼和浩特', '包头', '赤峰', '鄂尔多斯'],
    '辽宁': ['辽宁', '沈阳', '大连', '鞍山', '抚顺', '本溪', '丹东', '锦州', '营口', '阜新', '辽阳', '盘锦', '铁岭', '朝阳', '葫芦岛'],
    '吉林': ['吉林', '长春', '延边', '通化', '白城', '四平', '辽源', '松原'],
    '黑龙江': ['黑龙江', '哈尔滨', '齐齐哈尔', '牡丹江', '大庆', '佳木斯', '鸡西', '双鸭山', '伊春', '七台河', '鹤岗', '黑河', '绥化'],
    '上海': ['上海', '沪', '复旦', '交通', '同济', '华东师范', '华东理工', '东华', '上海师范', '上海大学', '上海理工', '上海海事', '上海工程', '上海应用', '上海电机', '上海政法', '上海商学院', '上海立信', '上海第二工业', '上海视觉', '上海外国语', '上海戏剧', '上海音乐', '上海体育', '上海科技', '上海电力', '上海海洋', '上海中医药', '上海对外经贸', '上海健康医学院', '上海杉达', '上海建桥', '上海兴伟', '上海立达'],
    '江苏': ['江苏', '南京', '苏州', '无锡', '常州', '徐州', '南通', '扬州', '盐城', '淮安', '连云港', '镇江', '泰州', '宿迁', '东南', '河海', '江南', '中国矿业', '南京师范', '南京航空', '南京理工', '南京农业', '南京林业', '南京信息工程', '南京邮电', '南京中医药', '南京医科', '南京审计', '苏州科技', '常熟理工', '淮阴工学院', '金陵科技'],
    '浙江': ['浙江', '杭州', '宁波', '温州', '嘉兴', '湖州', '绍兴', '金华', '衢州', '舟山', '台州', '丽水'],
    '安徽': ['安徽', '合肥', '芜湖', '蚌埠', '淮南', '马鞍山', '淮北', '铜陵', '安庆', '黄山', '阜阳', '宿州', '滁州', '六安', '宣城', '池州', '亳州'],
    '福建': ['福建', '福州', '厦门', '泉州', '漳州', '莆田', '三明', '南平', '龙岩', '宁德', '华侨'],
    '江西': ['江西', '南昌', '九江', '赣州', '吉安', '宜春', '抚州', '上饶', '鹰潭', '景德镇', '萍乡', '新余'],
    '河南': ['河南', '郑州', '开封', '洛阳', '平顶山', '安阳', '鹤壁', '新乡', '焦作', '濮阳', '许昌', '漯河', '三门峡', '南阳', '商丘', '信阳', '周口', '驻马店', '济源', '黄河科技', '中原工学院'],
    '湖北': ['湖北', '武汉', '黄石', '十堰', '荆州', '宜昌', '襄阳', '鄂州', '荆门', '孝感', '黄冈', '咸宁', '随州', '恩施', '华中科技', '武汉大学', '华中师范', '华中农业', '中国地质', '武汉理工', '中南财经政法', '武汉科技', '三峡'],
    '湖南': ['湖南', '长沙', '株洲', '湘潭', '衡阳', '邵阳', '岳阳', '常德', '张家界', '益阳', '郴州', '永州', '怀化', '娄底', '湘西', '中南', '湖南师范', '湘潭大学'],
    '广东': ['广东', '广州', '深圳', '珠海', '汕头', '韶关', '佛山', '江门', '湛江', '茂名', '肇庆', '惠州', '梅州', '汕尾', '河源', '阳江', '清远', '东莞', '中山', '潮州', '揭阳', '云浮', '岭南', '华南理工', '华南师范', '华南农业', '暨南', '广州美术'],
    '广西': ['广西', '南宁', '柳州', '桂林', '梧州', '北海', '防城港', '钦州', '贵港', '玉林', '百色', '贺州', '河池', '来宾', '崇左'],
    '海南': ['海南', '海口', '三亚'],
    '重庆': ['重庆', '渝'],
    '四川': ['四川', '成都', '自贡', '攀枝花', '泸州', '德阳', '绵阳', '广元', '遂宁', '内江', '乐山', '南充', '眉山', '宜宾', '广安', '达州', '雅安', '巴中', '资阳', '阿坝', '甘孜', '凉山', '西南交通', '西南财经', '四川大学', '电子科技'],
    '贵州': ['贵州', '贵阳', '六盘水', '遵义', '安顺', '铜仁', '黔西南', '毕节', '黔东南', '黔南'],
    '云南': ['云南', '昆明', '曲靖', '玉溪', '保山', '昭通', '丽江', '普洱', '临沧', '楚雄', '红河', '文山', '西双版纳', '大理', '德宏', '怒江', '迪庆'],
    '西藏': ['西藏', '拉萨'],
    '陕西': ['陕西', '西安', '铜川', '宝鸡', '咸阳', '渭南', '延安', '汉中', '榆林', '安康', '商洛', '西北', '长安'],
    '甘肃': ['甘肃', '兰州', '嘉峪关', '金昌', '白银', '天水', '武威', '张掖', '平凉', '酒泉', '庆阳', '定西', '陇南', '临夏', '甘南', '西北师范'],
    '青海': ['青海', '西宁'],
    '宁夏': ['宁夏', '银川', '石嘴山', '吴忠', '固原', '中卫'],
    '新疆': ['新疆', '乌鲁木齐', '克拉玛依', '吐鲁番', '哈密', '昌吉', '博尔塔拉', '巴音郭楞', '阿克苏', '克孜勒苏', '喀什', '和田', '伊犁', '塔城', '阿勒泰', '石河子', '阿拉尔', '图木舒克', '五家渠', '北屯', '铁门关', '双河', '可克达拉', '昆玉', '胡杨河']
};

// 省份识别函数
function identifyProvince(collegeName) {
    for (const [province, keywords] of Object.entries(PROVINCE_KEYWORDS)) {
        if (keywords.some(keyword => collegeName.includes(keyword))) {
            return province;
        }
    }
    return '其他';
}

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
        const collegeTypes = ref({}); // 院校类型映射（公办/民办）
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
                // 加载投档数据
                const response = await fetch('data/scores.json');
                allData.value = await response.json();
                
                // 加载院校类型数据
                const typesResponse = await fetch('data/college_types.json');
                const typesData = await typesResponse.json();
                
                // 构建院校名称到类型的映射
                const typeMap = {};
                Object.keys(typesData).forEach(type => {
                    typesData[type].forEach(college => {
                        typeMap[college] = type;
                    });
                });
                collegeTypes.value = typeMap;
            } catch (error) {
                console.error('加载数据失败:', error);
                alert('数据加载失败，请检查网络或数据文件。');
            }
        });

        // 获取院校类型（公办/民办/独立学院）
        const getCollegeType = (collegeName) => {
            // 提取院校名称（去掉代号部分）
            const cleanName = collegeName.replace(/^[A-Z]\d+\s*/, '');
            return collegeTypes.value[cleanName] || '公办'; // 默认为公办
        };

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

            // 过滤推荐院校：综合分低于或等于用户综合分，优先推荐山东省内公办院校
            recommendations.value = allData.value
                .filter(item => item.min_composite_score <= userCompositeScore.value)
                .map(item => {
                    const province = identifyProvince(item.college_code_name);
                    const collegeType = getCollegeType(item.college_code_name);
                    return {
                        ...item,
                        // 智能识别省份（使用关键词映射）
                        province: province,
                        // 院校类型（公办/民办/独立学院）
                        collegeType: collegeType,
                        // 计算分数差值
                        diff: userCompositeScore.value - item.min_composite_score,
                        // 标记是否为山东省内院校
                        isShandong: province === '山东',
                        // 标记是否为公办院校
                        isPublic: collegeType === '公办'
                    };
                })
                .sort((a, b) => {
                    // 排序优先级：山东公办 > 省外公办 > 山东民办 > 省外民办
                    // 计算排序权重（数值越大优先级越高）
                    const getWeight = (item) => {
                        if (item.isShandong && item.isPublic) return 4; // 山东公办
                        if (!item.isShandong && item.isPublic) return 3; // 省外公办
                        if (item.isShandong && !item.isPublic) return 2; // 山东民办
                        return 1; // 省外民办
                    };
                    
                    const weightA = getWeight(a);
                    const weightB = getWeight(b);
                    
                    if (weightA !== weightB) {
                        return weightB - weightA; // 按权重排序
                    }
                    // 同级别内按综合分从高到低排序
                    return b.min_composite_score - a.min_composite_score;
                });
            
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
