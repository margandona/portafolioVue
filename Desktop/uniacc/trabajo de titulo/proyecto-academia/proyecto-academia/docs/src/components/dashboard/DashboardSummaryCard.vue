<template>
  <div class="summary-card" :class="customClass">
    <div class="summary-icon">
      <i :class="icon"></i>
    </div>
    <div class="summary-content">
      <h3>{{ value }}</h3>
      <p>{{ label }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "DashboardSummaryCard",
  props: {
    icon: {
      type: String,
      required: true
    },
    value: {
      type: [String, Number],
      required: true
    },
    label: {
      type: String,
      required: true
    },
    customClass: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
.summary-card {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 20px;
  display: flex;
  align-items: center;
  transition: transform 0.2s, box-shadow 0.2s;
}

.summary-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.15);
}

.summary-icon {
  width: 50px;
  height: 50px;
  background-color: rgba(46, 139, 87, 0.1);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 15px;
}

.summary-icon i {
  font-size: 22px;
  color: #2E8B57;
}

.summary-content h3 {
  font-size: 24px;
  font-weight: 700;
  color: #2A3B5F;
  margin: 0;
}

.summary-content p {
  margin: 5px 0 0;
  color: #6c757d;
  font-size: 14px;
}
</style>
